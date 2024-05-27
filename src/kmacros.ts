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
          /([,;{}()]\s*\/\*[\s\S]*?\*\/)|([,;{}()]\s*\/\/(?!#).*)|([,;{}()]\s*#(?!#).*)/gm,
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
}

export function deactivate() {}
