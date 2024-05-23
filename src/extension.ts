import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "extension.createHuggingFaceLink",
    async () => {
      const editor = vscode.window.activeTextEditor;

      if (editor) {
        const selections = editor.selections;
        await editor.edit((editBuilder) => {
          for (const selection of selections) {
            const text = editor.document.getText(selection);
            const lines = text.split("\n").filter((line) => line.trim() !== ""); // Split text into lines and filter out empty lines
            for (const line of lines) {
              const formattedText = `- [${line}](https://huggingface.co/k4d3/yiff_toolkit/resolve/main/ponyxl_loras_shrunk/${line}?download=true)\n`;
              editBuilder.replace(selection, formattedText);
            }
          }
        });
      }
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
