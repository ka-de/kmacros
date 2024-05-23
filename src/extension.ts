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
            lines.forEach((line, index) => {
              const formattedText = `- [${line}](https://huggingface.co/k4d3/yiff_toolkit/resolve/main/ponyxl_loras_shrunk/${line}?download=true)`;
              if (index === 0) {
                editBuilder.replace(selection, formattedText);
              } else {
                editBuilder.insert(selection.end, `\n${formattedText}`);
              }
            });
          });
        });
      }
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
