import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "kmacros.createHuggingFaceLink",
    async () => {
      const editor = vscode.window.activeTextEditor;

      if (editor) {
        const selections = editor.selections;
        await editor.edit((editBuilder) => {
          selections.forEach((selection) => {
            const text = editor.document.getText(selection);
            const lines = text.split("\n").filter((line) => line.trim() !== ""); // Split text into lines and filter out empty lines
            let replacedText = "";
            lines.forEach((line, index) => {
              // Remove newline characters within the line and trim whitespace
              const sanitizedLine = line.replace(/\n/g, "").trim();
              const formattedText = `- [${sanitizedLine}](https://huggingface.co/k4d3/yiff_toolkit/resolve/main/ponyxl_loras_shrunk/${sanitizedLine.trim()}?download=true)`;
              replacedText += formattedText;
              if (index < lines.length - 1) {
                replacedText += "\n"; // Add a newline only if it's not the last line
              }
            });
            editBuilder.replace(selection, replacedText);
          });
        });
      }
    }
  );

  let removeCommentsDisposable = vscode.commands.registerCommand(
    "kmacros.removeCommentsOnCopy",
    async () => {
      const editor = vscode.window.activeTextEditor;

      if (!editor) {
        vscode.window.showErrorMessage("No active editor");
        return;
      }

      if (!vscode.env.clipboard) {
        vscode.window.showErrorMessage("Clipboard not accessible");
        return;
      }

      // Access the configuration
      const config = vscode.workspace.getConfiguration("kmacros");
      const removeCommentsInMarkdown = config.get("removeCommentsInMarkdown");
      const removeWhitespaceInMarkdown = config.get(
        "removeWhitespaceInMarkdown"
      );
      const showNotifications = config.get("showNotifications");

      // Get the selected text
      const selection = editor.selection;
      let selectedText = editor.document.getText(selection);

      // Write the selected text to the clipboard
      await vscode.env.clipboard.writeText(selectedText);

      // Read the text from the clipboard
      let clipboardText = await vscode.env.clipboard.readText();

      // Booleans to track if an action is completed.
      let commentsRemoved = false;
      let whitespaceRemoved = false;

      // Remove comments and empty lines
      if (
        editor.document.languageId !== "markdown" ||
        removeCommentsInMarkdown
      ) {
        clipboardText = clipboardText.replace(
          /(?<!:)(\/\/.*$)|(\/\*[\s\S]*?\*\/)/gm,
          ""
        );
        commentsRemoved = true;
      }

      if (
        editor.document.languageId !== "markdown" ||
        removeWhitespaceInMarkdown
      ) {
        clipboardText = clipboardText.replace(/^\s*[\r\n]/gm, "");
        whitespaceRemoved = true;
      }

      // Write the cleaned text back to the clipboard
      await vscode.env.clipboard.writeText(clipboardText);

      if (showNotifications) {
        if (commentsRemoved && whitespaceRemoved) {
          vscode.window.showInformationMessage(
            "Comments and empty lines removed from clipboard."
          );
        } else if (commentsRemoved) {
          vscode.window.showInformationMessage(
            "Comments removed from clipboard."
          );
        } else if (whitespaceRemoved) {
          vscode.window.showInformationMessage(
            "Whitespace removed from clipboard"
          );
        }
      }
    }
  );

  context.subscriptions.push(disposable, removeCommentsDisposable);

  let inlineMacroArgsDisposable = vscode.commands.registerCommand(
    "kmacros.inlineMacroArgs",
    async () => {
      const editor = vscode.window.activeTextEditor;

      if (!editor) {
        vscode.window.showErrorMessage("No active editor");
        return;
      }

      await editor.edit((editBuilder) => {
        for (const selection of editor.selections) {
          const line = editor.document.lineAt(selection.start.line);
          const lineText = line.text;

          const newText = inlineMacroArgs(lineText);

          if (newText !== lineText) {
            editBuilder.replace(line.range, newText);
          }
        }
      });

      // Run document formatting
      await vscode.commands.executeCommand("editor.action.formatDocument");
    }
  );

  context.subscriptions.push(disposable, inlineMacroArgsDisposable);

  function inlineMacroArgs(text: string): string {
    const macroRegex =
      /(format|print|println|eprint|eprintln|write|writeln|format_args|panic|unreachable|todo|assert|assert_eq|debug_assert|debug_assert_eq)!\s*\((["'])((?:(?!\2).|\\\2)*)\2\s*(?:,\s*(.*))?\)/;
    const match = text.match(macroRegex);

    if (!match) {
      return text;
    }

    const [fullMatch, macroName, _, formatString, args] = match;
    if (!args) {
      return text;
    }

    const argList = args.split(",").map((arg) => arg.trim());
    let newFormatString = formatString;
    let unusedArgs: (string | undefined)[] = [...argList];

    // Replace numbered placeholders
    newFormatString = newFormatString.replace(
      /\{(\d+)([^}]*)\}/g,
      (match, index, specifier) => {
        const arg = argList[parseInt(index)];
        if (arg) {
          unusedArgs[parseInt(index)] = undefined;
          return `{${arg}${specifier}}`;
        }
        return match;
      }
    );

    // Replace remaining placeholders
    newFormatString = newFormatString.replace(
      /\{([^}]*)\}/g,
      (match, specifier) => {
        const arg = unusedArgs.find((a) => a !== undefined);
        if (arg) {
          const index = unusedArgs.indexOf(arg);
          unusedArgs[index] = undefined;
          return `{${arg}${specifier}}`;
        }
        return match;
      }
    );

    // Add remaining unused arguments
    const remainingArgs = unusedArgs.filter(
      (arg): arg is string => arg !== undefined
    );

    return `${macroName}!("${newFormatString}"${
      remainingArgs.length ? ", " + remainingArgs.join(", ") : ""
    })`;
  }
}

export function deactivate() {}
