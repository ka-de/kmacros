import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "extension.createHuggingFaceLink",
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
    "extension.removeCommentsOnCopy",
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

      // Get the selected text
      const selection = editor.selection;
      let selectedText = editor.document.getText(selection);

      // Write the selected text to the clipboard
      await vscode.env.clipboard.writeText(selectedText);

      // Read the text from the clipboard
      let clipboardText = await vscode.env.clipboard.readText();

      // Remove comments and empty lines
      let commentRemovedText = clipboardText.replace(
        /(\/\*[\s\S]*?\*\/)|(\/\/.*)|(#.*)/g,
        ""
      );
      let noEmptyLinesText = commentRemovedText.replace(/^\s*[\r\n]/gm, "");

      // Write the cleaned text back to the clipboard
      await vscode.env.clipboard.writeText(noEmptyLinesText);

      /*
      vscode.window.showInformationMessage(
        "Comments and empty lines removed from clipboard"
      );
      */
    }
  );

  context.subscriptions.push(disposable, removeCommentsDisposable);
}

export function deactivate() {}
