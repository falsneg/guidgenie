# GUID Genie

Simple vscode extension for generating UUID v4

## Features

- Generate as many GUIDs as you want

## Commands

- **Generate GUID**: `guidgenie.generateGuid`
  - To generate a GUID, use the editor context menu, or press `Ctrl+D` or `Cmd+D` on macOS.

## Settings

Configuration is available in VS Code Settings (`Ctrl+,`) under "GUID Genie".

| Setting                 | Default | Description                                 |
| :---------------------- | :------ | :------------------------------------------ |
| `guidgenie.uppercase`   | `true`  | If true, output is uppercase.               |
| `guidgenie.includeBraces` | `true`  | If true, the output is enclosed in braces. |

### Keybinding Customization

The default keybinding can be changed in Keyboard Shortcuts (`Ctrl+K Ctrl+S`) for the `guidgenie.generateGuid` command.

Alternatively, define a custom binding in `keybindings.json`:

```json
{
  "key": "ctrl+shift+u",
  "command": "guidgenie.generateGuid",
  "when": "editorTextFocus"
}
```

## Installation and Building

### VSIX Installation

1. Download the `.vsix` file.

2. From the Command Palette (`Ctrl+Shift+P`), run `Extensions: Install from VSIX...` and select the file.

### Building from Source

To create a `.vsix` package from the source code:

```bash
# Install the VS Code extension packager
npm install -g vsce

# Create the package
vsce package
```

To run a development version, open the project folder in VS Code and press `F5`.