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

  /**
   * Try it out by selecting this: Math.sin(0.5);
   * and pressing Alt + 0.
   * It will output: 0.479425538604203
   *
   * You can also eval this one: eval("Math.sin(0.5)*6*5");
   * and it will output this:    14.38276615812609
   *
   * Or.. if you are a game developer, you can also do silly stuff
   * like `Math.PI*2` and it will output: 6.283185307179586
   * Or.. `Math.cos(0.5)` and it will output: 0.8775825618903728
   * 
   * You can also flip booleans case sensitively, try it out!
   * This false is true, and this True is False.
   */
  let hotdogDisposable = vscode.commands.registerCommand(
    "kmacros.hotdog",
    () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        const selection = editor.selection;
        const text = editor.document.getText(selection);

        try {
          let result;
          // Flip booleans if the text is a boolean value
          if (text === "true") {
            result = "false";
          } else if (text === "false") {
            result = "true";
          } else if (text === "True") {
            result = "False";
          } else if (text === "False") {
            result = "True";
          } else {
            // Use eval() to calculate the result
            // Note: eval() can be dangerous if used with untrusted input
            result = eval(text);
          }

          // Replace the selection with the calculated result or flipped boolean
          editor.edit((editBuilder) => {
            editBuilder.replace(selection, result.toString());
          });
        } catch (error) {
          let errorMessage = "An error occurred during calculation";
          if (error instanceof Error) {
            errorMessage = error.message;
          } else if (typeof error === "string") {
            errorMessage = error;
          }
          vscode.window.showErrorMessage(`Invalid expression: ${errorMessage}`);
        }
      }
    }
  );

  context.subscriptions.push(hotdogDisposable);

  let selectAllDisposable = vscode.commands.registerCommand(
    "kmacros.selectAll",
    () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        const lastLine = editor.document.lineCount - 1;
        const lastLineLength = editor.document.lineAt(lastLine).text.length;
        const selection = new vscode.Selection(0, 0, lastLine, lastLineLength);
        editor.selection = selection;
      }
    }
  );

  context.subscriptions.push(selectAllDisposable);

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
        const document = editor.document;
        const cursorPosition = editor.selection.active;
        let startLine = cursorPosition.line;
        let endLine = startLine;

        // Find the ending line (line with `);`)
        while (endLine < document.lineCount - 1) {
          if (document.lineAt(endLine).text.trim().endsWith(");")) {
            break;
          }
          endLine++;
        }

        // Get the text of the range
        const range = new vscode.Range(
          new vscode.Position(startLine, 0),
          new vscode.Position(endLine, document.lineAt(endLine).text.length)
        );
        const selectedText = document.getText(range);

        const newText = inlineMacroArgs(selectedText);

        if (newText !== selectedText) {
          editBuilder.replace(range, newText);
        }
      });

      // Run document formatting
      await vscode.commands.executeCommand("editor.action.formatDocument");
    }
  );

  context.subscriptions.push(disposable, inlineMacroArgsDisposable);

  function inlineMacroArgs(text: string): string {
    const macroRegex =
      /((.*?)(format|print|println|eprint|eprintln|write|writeln|format_args|panic|unreachable|todo|assert|assert_eq|debug_assert|debug_assert_eq)!\s*\(\s*(["']))((?:(?!\4).|[\s\S])*?)\4\s*(?:,\s*([\s\S]*?))?\s*\)(.*)$/;
    const match = text.match(macroRegex);

    if (!match) {
      return text;
    }

    const [
      fullMatch,
      prefix,
      beforeMacro,
      macroName,
      quote,
      formatString,
      args,
      suffix
    ] = match;
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

    // Handle the {0:1$} case
    newFormatString = newFormatString.replace(
      /\{(\d+):1\$\}/g,
      (match, index) => {
        const arg = argList[parseInt(index)];
        const widthArg = unusedArgs.find(
          (a, i) => a !== undefined && i > parseInt(index)
        );

        if (arg && widthArg) {
          unusedArgs[unusedArgs.indexOf(widthArg)] = undefined;
          return `{${arg}:${widthArg}$}`;
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

    // Handle special cases
    newFormatString = newFormatString
      .replace(/\{(\w+)\s*=\s*(\w+)(:[^}]*)\}/g, "{$2$3}")
      .replace(/\{(\w+)v:([^}]*)\}/g, "{$1:$2}")
      .replace(/\{(\w+):\.(\*)\}/g, (match, name) => {
        const precisionArg = unusedArgs.find(
          (arg) => arg !== undefined && arg !== name
        );

        if (precisionArg) {
          unusedArgs[unusedArgs.indexOf(precisionArg)] = undefined;
          return `{${name}:.${precisionArg}$}`;
        }

        return match;
      });

    // Add remaining unused arguments
    const remainingArgs = unusedArgs.filter(
      (arg): arg is string => arg !== undefined
    );

    // Construct the new macro call, preserving multiline format if necessary
    const newMacroCall = `${prefix}${newFormatString}${quote}${
      remainingArgs.length ? ", " + remainingArgs.join(", ") : ""
    })${suffix}`;

    // If the original macro call was multiline, format the new one similarly
    if (fullMatch.includes("\n")) {
      return newMacroCall.replace(/\(/, "(\n    ").replace(/\)(?=.*)/, "\n)");
    }

    return newMacroCall;
  } // inlineMacroArgs
} // activate

export function deactivate() {}
