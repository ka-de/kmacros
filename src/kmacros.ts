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
   * `hotdogDisposable` is a cooler function than it sounds!
   * It can either run an eval on an expression you have selected,
   * or flip boolean values and it can try to guess the context
   * from the contents of the current line if you don't have anything
   * selected.
   *
   * Try it out by selecting this: Math.cos(0.5);
   * and pressing Alt + 0.
   * It will output: 0.479425538604203
   *
   * You can also eval this one: eval(Math.sin(0.5));
   * and it will output this:    0.479425538604203
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
        let selection = editor.selection;
        let text = editor.document.getText(selection);
        let fullLineText = "";

        // If no text is selected, get the text of the current line
        if (text === "") {
          const line = editor.document.lineAt(selection.start.line);
          fullLineText = line.text;
          text = fullLineText.trim();
          selection = new vscode.Selection(line.range.start, line.range.end);
        }

        try {
          let result: string | number;
          let matchStart = 0;
          let matchEnd = 0;
          let expression: string;

          // Function to flip boolean values
          const flipBoolean = (value: string): string => {
            const lowerValue = value.toLowerCase();
            return lowerValue === "true"
              ? "false"
              : lowerValue === "false"
              ? "true"
              : value;
          };

          // Check for delimited expressions first
          const delimiterMatch = fullLineText.match(/:\s*(.+?);/);
          if (delimiterMatch) {
            expression = delimiterMatch[1].trim();
            matchStart = fullLineText.indexOf(expression);
            matchEnd = matchStart + expression.length;
            result = eval(expression);
          } else {
            // Check for embedded booleans
            const booleanMatch = fullLineText.match(
              /\b(true|false|True|False)\b/
            );
            if (booleanMatch) {
              expression = booleanMatch[1];
              matchStart = booleanMatch.index ?? 0; // Use 0 as a fallback if index is undefined
              matchEnd = matchStart + expression.length;
              result = flipBoolean(expression);
            } else {
              throw new Error(
                "No valid expression or boolean found in the line"
              );
            }
          }

          // Replace only the matched expression or boolean
          editor.edit((editBuilder) => {
            if (fullLineText) {
              const start = new vscode.Position(
                selection.start.line,
                matchStart
              );
              const end = new vscode.Position(selection.start.line, matchEnd);
              editBuilder.replace(
                new vscode.Range(start, end),
                result.toString()
              );
            } else {
              editBuilder.replace(selection, result.toString());
            }
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

  /**
   * Inlines macro arguments in a given text string.
   * This function processes Rust-style macro calls and attempts to inline their arguments.
   *
   * @param text - The input text containing the macro call.
   * @returns The processed text with inlined macro arguments.
   */
  function inlineMacroArgs(text: string): string {
    // Regular expression to match Rust-style macro calls
    const macroRegex =
      /((.*?)(format|print|println|eprint|eprintln|write|writeln|format_args|panic|unreachable|todo|assert|assert_eq|debug_assert|debug_assert_eq)!\s*\(\s*(["']))((?:(?!\4).|[\s\S])*?)\4\s*(?:,\s*([\s\S]*?))?\s*\)(.*)$/;
    const match = text.match(macroRegex);
    if (!match) {
      return text; // Return original text if no macro call is found
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
      return text; // Return original text if no arguments are found
    }

    // Split arguments, preserving parentheses and brackets
    const argList = splitArgsPreservingBrackets(args);
    let newFormatString = formatString;
    let unusedArgs: (string | undefined)[] = [...argList];

    // Replace numbered placeholders with corresponding arguments
    newFormatString = newFormatString.replace(
      /\{(\d+)([^}]*)\}/g,
      (match, index, specifier) => {
        const arg = argList[parseInt(index)];
        if (arg && !containsBrackets(arg)) {
          unusedArgs[parseInt(index)] = undefined;
          return `{${arg}${specifier}}`;
        }
        return match;
      }
    );

    // Handle width specifiers
    newFormatString = newFormatString.replace(
      /\{(\d+):1\$\}/g,
      (match, index) => {
        const arg = argList[parseInt(index)];
        const widthArg = unusedArgs.find(
          (a, i) =>
            a !== undefined && i > parseInt(index) && !containsBrackets(a!)
        );
        if (arg && widthArg && !containsBrackets(arg)) {
          unusedArgs[unusedArgs.indexOf(widthArg)] = undefined;
          return `{${arg}:${widthArg}$}`;
        }
        return match;
      }
    );

    // Replace remaining placeholders with unused arguments
    newFormatString = newFormatString.replace(
      /\{([^}]*)\}/g,
      (match, specifier) => {
        const arg = unusedArgs.find(
          (a) => a !== undefined && !containsBrackets(a!)
        );
        if (arg) {
          const index = unusedArgs.indexOf(arg);
          unusedArgs[index] = undefined;
          return `{${arg}${specifier}}`;
        }
        return match;
      }
    );

    // Additional formatting replacements
    newFormatString = newFormatString
      .replace(/\{(\w+)\s*=\s*(\w+)(:[^}]*)\}/g, "{$2$3}")
      .replace(/\{(\w+)v:([^}]*)\}/g, "{$1:$2}")
      .replace(/\{(\w+):\.(\*)\}/g, (match, name) => {
        const precisionArg = unusedArgs.find(
          (arg) => arg !== undefined && arg !== name && !containsBrackets(arg!)
        );
        if (precisionArg) {
          unusedArgs[unusedArgs.indexOf(precisionArg)] = undefined;
          return `{${name}:.${precisionArg}$}`;
        }
        return match;
      });

    // Collect remaining unused arguments
    const remainingArgs = unusedArgs.filter(
      (arg): arg is string => arg !== undefined
    );

    // Construct the new macro call
    const newMacroCall = `${prefix}${newFormatString}${quote}${
      remainingArgs.length ? ", " + remainingArgs.join(", ") : ""
    })${suffix}`;

    // Format multi-line macro calls
    if (fullMatch.includes("\n")) {
      return newMacroCall.replace(/\(/, "(\n    ").replace(/\)(?=.*)/, "\n)");
    }
    return newMacroCall;
  }

  /**
   * Checks if a string contains parentheses or square brackets.
   *
   * @param str - The string to check.
   * @returns True if the string contains parentheses or square brackets, false otherwise.
   */
  function containsBrackets(str: string): boolean {
    return /[\(\)\[\]]/.test(str);
  }

  /**
   * Splits a string of arguments into an array, preserving parentheses and brackets.
   *
   * @param args - The string of arguments to split.
   * @returns An array of individual arguments.
   */
  function splitArgsPreservingBrackets(args: string): string[] {
    const result: string[] = [];
    let currentArg = "";
    let depth = 0;

    for (let i = 0; i < args.length; i++) {
      const char = args[i];
      if (char === "(" || char === "[") {
        depth++;
      } else if (char === ")" || char === "]") {
        depth--;
      }

      if (char === "," && depth === 0) {
        result.push(currentArg.trim());
        currentArg = "";
      } else {
        currentArg += char;
      }
    }

    if (currentArg.trim()) {
      result.push(currentArg.trim());
    }

    return result;
  } // inlineMacroArgs
} // activate

export function deactivate() {}
