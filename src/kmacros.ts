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
              const formattedText = `- [${sanitizedLine}](https://huggingface.co/k4d3/yiff_toolkit/resolve/main/${sanitizedLine.trim()}?download=true)`;
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

  let cloneHtmlElementWithoutIncrementDisposable =
    vscode.commands.registerCommand(
      "kmacros.cloneHtmlElementWithoutIncrement",
      async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
          return;
        }

        const document = editor.document;
        const cursorPosition = editor.selection.active;

        // Find the start and end of the HTML element
        const elementRange = findHtmlElementRange(document, cursorPosition);
        if (!elementRange) {
          vscode.window.showInformationMessage(
            "No HTML element found at cursor position."
          );
          return;
        }

        const elementText = document.getText(elementRange);

        await editor.edit((editBuilder) => {
          editBuilder.insert(elementRange.end, "\n" + elementText);
        });

        // Format the document
        await vscode.commands.executeCommand("editor.action.formatDocument");
      }
    );

  let cloneHtmlElementDisposable = vscode.commands.registerCommand(
    "kmacros.cloneHtmlElement",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }

      const document = editor.document;
      const cursorPosition = editor.selection.active;

      // Find the start and end of the HTML element
      const elementRange = findHtmlElementRange(document, cursorPosition);
      if (!elementRange) {
        vscode.window.showInformationMessage(
          "No HTML element found at cursor position."
        );
        return;
      }

      const elementText = document.getText(elementRange);
      const clonedText = incrementNumbers(elementText);

      await editor.edit((editBuilder) => {
        editBuilder.insert(elementRange.end, "\n" + clonedText);
      });

      // Format the document
      await vscode.commands.executeCommand("editor.action.formatDocument");
    }
  );

  function findHtmlElementRange(
    document: vscode.TextDocument,
    position: vscode.Position
  ): vscode.Range | null {
    const text = document.getText();
    const offset = document.offsetAt(position);

    let startOffset = offset;
    let endOffset = offset;
    let openTagName = "";
    let depth = 0;

    // Find opening tag
    while (startOffset > 0) {
      if (text[startOffset] === ">") {
        depth++;
      } else if (text[startOffset] === "<") {
        if (depth === 0) {
          // Extract tag name
          let tagNameEnd = startOffset + 1;
          while (
            tagNameEnd < text.length &&
            /[a-zA-Z0-9]/.test(text[tagNameEnd])
          ) {
            tagNameEnd++;
          }
          openTagName = text.substring(startOffset + 1, tagNameEnd);
          break;
        }
        depth--;
      }
      startOffset--;
    }

    if (!openTagName) {
      return null;
    }

    // Find closing tag or end of self-closing tag
    depth = 1;
    endOffset = startOffset + 1;
    while (endOffset < text.length) {
      if (text[endOffset] === "<") {
        if (text[endOffset + 1] === "/") {
          const closeTagStart = endOffset + 2;
          const closeTagEnd = text.indexOf(">", closeTagStart);
          if (closeTagEnd !== -1) {
            const closeTagName = text
              .substring(closeTagStart, closeTagEnd)
              .trim();
            if (closeTagName === openTagName) {
              depth--;
              if (depth === 0) {
                endOffset = closeTagEnd + 1;
                break;
              }
            }
          }
        } else if (
          text.substr(endOffset, openTagName.length + 1) ===
          "<" + openTagName
        ) {
          depth++;
        }
      } else if (text[endOffset] === "/" && text[endOffset + 1] === ">") {
        if (depth === 1) {
          endOffset += 2;
          break;
        }
      }
      endOffset++;
    }

    if (startOffset < endOffset) {
      return new vscode.Range(
        document.positionAt(startOffset),
        document.positionAt(endOffset)
      );
    }

    return null;
  }

  function incrementNumbers(text: string): string {
    return text.replace(/\d+/g, (match) => {
      const num = parseInt(match, 10);
      return (num + 1).toString();
    });
  }

  /**
   * `hotdogDisposable` is a cooler function than it sounds!
   * It can either run an eval on an expression you have selected,
   * or flip boolean values and it can try to guess the context
   * from the contents of the current line if you don't have anything
   * selected.
   *
   * Try it out by selecting this line: Math.cos(0.5)
   * and pressing Alt + 0.
   * It will output: 0.8775825618903728
   *
   * You can also eval this one: Math.sin(1);
   * and it will output this:    0.8414709848078965
   *
   * Or.. if you are a game developer, you can also do silly stuff
   * like Math.PI*2 and it will output: 6.283185307179586
   *
   * You can also flip booleans case sensitively, try it out!
   *
   * "Only a false bitch would know what to do in this situation!"
   *
   * if (brain.dead == true) {
   *     // Do nothing
   * }
   */
  let hotdogDisposable = vscode.commands.registerCommand(
    "kmacros.hotdog",
    () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        let selection = editor.selection;
        let text = editor.document.getText(selection);
        let fullLineText = "";
        if (text === "") {
          const line = editor.document.lineAt(selection.start.line);
          fullLineText = line.text;
          text = fullLineText;
          selection = new vscode.Selection(line.range.start, line.range.end);
        }
        try {
          let result: string | number | undefined;
          let matchStart = 0;
          let matchEnd = 0;
          let expression: string;

          // Function to flip boolean
          const flipBoolean = (value: string): string => {
            return value.replace(/\b(true|false|True|False)\b/g, (match) => {
              return match === "true"
                ? "false"
                : match === "false"
                ? "true"
                : match === "True"
                ? "False"
                : match === "False"
                ? "True"
                : match;
            });
          };

          // Function to extract expression from possible comment or backticks
          const extractExpression = (
            input: string
          ): [number, number, string] => {
            const trimmed = input.trim().replace(/^[*/-]+\s*/, "");
            const backtickMatch = trimmed.match(/`([^`]+)`/);
            if (backtickMatch) {
              const start = input.indexOf(backtickMatch[0]);
              const end = start + backtickMatch[0].length;
              return [start, end, backtickMatch[1]];
            }
            const exprMatch = trimmed.match(
              /(Math\.\w+\([^)]*\)(?:\s*[-+*/]\s*[\d.]+)?|(?:\d+(?:\.\d+)?|\([^)]+\))(?:\s*[-+*/]\s*(?:\d+(?:\.\d+)?|\([^)]+\)))*|\btrue\b|\bfalse\b|\bTrue\b|\bFalse\b|(?:Math\.PI\s*[-+*/]\s*)*\d+(?:\.\d+)?)(?:;?\s*|$)/
            );
            if (exprMatch) {
              const start = input.indexOf(exprMatch[0]);
              const end = start + exprMatch[0].length;
              return [start, end, exprMatch[0].replace(/;$/, "")];
            }
            return [0, 0, ""];
          };

          [matchStart, matchEnd, expression] = extractExpression(text);

          if (expression) {
            if (expression.match(/\b(true|false|True|False)\b/)) {
              result = flipBoolean(expression);
            } else {
              result = new Function(`return ${expression}`)();
            }

            // Ensure result is always a string
            const resultString =
              result !== undefined ? result.toString() : "undefined";

            editor.edit((editBuilder) => {
              const start = new vscode.Position(
                selection.start.line,
                matchStart
              );
              const end = new vscode.Position(selection.start.line, matchEnd);

              // Check if there's already a space or non-alphanumeric character after the boolean
              const charAfterMatch = text.charAt(matchEnd);
              const suffix = /[a-zA-Z0-9]/.test(charAfterMatch) ? " " : "";

              editBuilder.replace(
                new vscode.Range(start, end),
                resultString + suffix
              );
            });
          } else {
            vscode.window.showInformationMessage("No valid expression found.");
          }
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
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        const lastLine = editor.document.lineCount - 1;
        const lastLineLength = editor.document.lineAt(lastLine).text.length;
        const selection = new vscode.Selection(0, 0, lastLine, lastLineLength);
        editor.selection = selection;

        // Copy selected text to clipboard
        const selectedText = editor.document.getText(selection);
        await vscode.env.clipboard.writeText(selectedText);

        // Show notification
        vscode.window.showInformationMessage(
          "Current file is copied to clipboard."
        );
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
