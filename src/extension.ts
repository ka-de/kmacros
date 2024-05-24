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
      if (!vscode.env.clipboard) {
        vscode.window.showErrorMessage("Clipboard not accessible");
        return;
      }

      let clipboardText = await vscode.env.clipboard.readText();
      let commentRemovedText = clipboardText.replace(
        /(\/\*[\s\S]*?\*\/)|(\/\/.*)|(#.*)/g,
        ""
      );
      await vscode.env.clipboard.writeText(commentRemovedText);
      vscode.window.showInformationMessage("Comments removed from clipboard");
    }
  );

  context.subscriptions.push(disposable, removeCommentsDisposable);
}

export function deactivate() {}
