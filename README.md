# kmacros

![An image of a hotdogwolf, guardian spirit of Rust developers.](https://cringe.live/images/kmacros/hotdogwolf.png)

`kmacros` is a powerful Visual Studio Code extension that provides a set of macros, keybindings, and commands to enhance your coding productivity. This extension is designed for developers who value efficiency and seek to streamline their workflow.

## Features

### 1. HTMLClone

**Shortcut:** `Ctrl + Alt + ]`

This command clones the HTML element at the current cursor position.

![A gif of the HTMLClone command](https://cringe.live/images/kmacros/htmlclone_without_increment.gif)

### 2. HTMLClone With Increment

**Shortcut:** `Ctrl + Alt + [`

Similar to the previous command, this clones the HTML element at the cursor position but also increments any numbers found within the element.

![A gif of the HTMLClone command](https://cringe.live/images/kmacros/htmlclone_with_increment.gif)

### 3. Calculate Selected Expression or Flip Booleans (Hotdog)

**Shortcut:** `Alt + 0`

This versatile command can:

- Evaluate mathematical expressions
- Flip boolean values
- Guess the context from the current line if no text is selected

Examples:

- Selecting `Math.cos(0.5)` and using the shortcut will output `0.8775825618903728`
- Flipping `true` to `false` or `True` to `False` (case-sensitive)

![An image of the hotdog command](https://cringe.live/images/kmacros/hotdog-disposable.gif)

### 4. Select All Text in File + Copy to Clipboard

**Shortcut:** `Ctrl + Alt + A` (Windows/Linux) or `Cmd + Alt + A` (Mac)

Selects all text in the current file and then copies it to the clipboard.

**Note:** This command is very handy for programmers using Large Language Models!

![An image of the select all command](https://cringe.live/images/kmacros/selectall-copy.gif)

### 5. Inline Rust Macro Arguments

**Shortcut:** `Ctrl + Alt + I` (Windows/Linux) or `Cmd + Alt + I` (Mac)

This command inlines arguments in Rust macros, making them more readable and concise.

![An image of the inline rust macro arguments command](https://cringe.live/images/kmacros/inline-arguments.gif)

### 6. Create HuggingFace Link

**Shortcut:** `Ctrl + Alt + H`

Generates a HuggingFace download link for the selected text, formatting it as a Markdown link.

![An image of the create huggingface link command](https://cringe.live/images/kmacros/hf-link.gif)

### 7. Remove Comments on Copy

**Shortcut:** `Ctrl + C`

This command overrides the default copy behavior. When copying text, it removes comments and can optionally remove whitespace, even in Markdown files (configurable).

![An image of the remove comments on copy command](https://cringe.live/images/kmacros/copy-nocomments.gif)

## Configuration

KMacros offers several configuration options to customize its behavior:

- `kmacros.showNotifications`: Enable/disable notifications from the extension (default: false)
- `kmacros.removeCommentsInMarkdown`: Remove comments in Markdown files when copying to clipboard (default: false)
- `kmacros.removeWhitespaceInMarkdown`: Remove whitespace in Markdown files when copying to clipboard (default: false)

You can modify these settings in your VSCode settings.json file or through the Settings UI.

## Installation

1. Open Visual Studio Code
2. Go to the Extensions view (Ctrl+Shift+X)
3. Search for "kmacros"
4. Click Install

## Usage

After installation, you can use the provided keyboard shortcuts or run the commands from the Command Palette (Ctrl+Shift+P or Cmd+Shift+P on Mac).

## Contributing

If you'd like to contribute to `kmacros`, please visit our [GitHub repository](https://github.com/ka-de/kmacros).

## License

This extension is released under the MIT License.

---

We hope `kmacros` helps boost your productivity in Visual Studio Code! If you encounter any issues or have suggestions for improvements, please don't hesitate to open an issue on our [GitHub repository](https://github.com/ka-de/kmacros).

**Enjoy!**
