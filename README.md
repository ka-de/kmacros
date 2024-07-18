# kmacros

<!-- markdownlint-disable MD033 -->

`kmacros` is a powerful Visual Studio Code extension that provides a set of macros, keybindings, and commands to enhance your coding productivity. This extension is designed for developers who value efficiency and seek to streamline their workflow.

## Features

### 1. HTMLClone

**Shortcut:** `Ctrl + ]`

This command clones the HTML element at the current cursor position.

<video width="640" height="360" controls>
  <source src="placeholder_video_url_clone_without_increment.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

### 2. HTMLClone With Increment

**Shortcut:** `Ctrl + [`

Similar to the previous command, this clones the HTML element at the cursor position but also increments any numbers found within the element.

<video width="640" height="360" controls>
  <source src="placeholder_video_url_clone_with_increment.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

### 3. Calculate Selected Expression or Flip Booleans

**Shortcut:** `Alt + 0`

This versatile command can:

- Evaluate mathematical expressions
- Flip boolean values
- Guess the context from the current line if no text is selected

Examples:

- Selecting `Math.cos(0.5)` and using the shortcut will output `0.8775825618903728`
- Flipping `true` to `false` or `True` to `False` (case-sensitive)

<video width="640" height="360" controls>
  <source src="placeholder_video_url_hotdog.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

### 4. Select All Text in File + Copy to Clipboard

**Shortcut:** `Ctrl + Alt + A` (Windows/Linux) or `Cmd + Alt + A` (Mac)

Selects all text in the current file and then copies it to the clipboard.

**Note:** This command is very handy for programmers using Large Language Models!

<video width="640" height="360" controls>
  <source src="placeholder_video_url_select_all.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

### 5. Inline Rust Macro Arguments

**Shortcut:** `Ctrl + Alt + I` (Windows/Linux) or `Cmd + Alt + I` (Mac)

This command inlines arguments in Rust macros, making them more readable and concise.

<video width="640" height="360" controls>
  <source src="placeholder_video_url_inline_macro_args.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

### 6. Create HuggingFace Link

**Shortcut:** `Ctrl + Alt + H`

Generates a HuggingFace download link for the selected text, formatting it as a Markdown link.

<video width="640" height="360" controls>
  <source src="placeholder_video_url_huggingface_link.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

### 7. Remove Comments on Copy

**Shortcut:** `Ctrl + C`

This command overrides the default copy behavior. When copying text, it removes comments and can optionally remove whitespace, even in Markdown files (configurable).

<video width="640" height="360" controls>
  <source src="placeholder_video_url_remove_comments_on_copy.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

## Configuration

KMacros offers several configuration options to customize its behavior:

- `kmacros.showNotifications`: Enable/disable notifications from the extension (default: false)
- `kmacros.removeCommentsInMarkdown`: Remove comments in Markdown files when copying to clipboard (default: false)
- `kmacros.removeWhitespaceInMarkdown`: Remove whitespace in Markdown files when copying to clipboard (default: false)

You can modify these settings in your VSCode settings.json file or through the Settings UI.

## Installation

1. Open Visual Studio Code
2. Go to the Extensions view (Ctrl+Shift+X)
3. Search for "KMacros"
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
