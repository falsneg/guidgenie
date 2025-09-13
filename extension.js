const vscode = require('vscode');
const crypto = require('crypto');

/**
* @param {vscode.ExtensionContext} context
*/
function activate(context) {
    const disposable = vscode.commands.registerCommand('guidgenie.generateGuid', async function (options) { // 1. Add 'async' here
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
        
        const config = vscode.workspace.getConfiguration('guidgenie');
        const uppercase = options?.uppercase ?? config.get('uppercase', true);
        const includeBraces = options?.includeBraces ?? config.get('includeBraces', false);
        
        await editor.edit(editBuilder => { // 2. Add 'await' here
            editor.selections.forEach(selection => {
                const guid = generateGuid(uppercase);
                const formattedGuid = formatGuid(guid, includeBraces, selection, editor);

                if (selection.isEmpty) {
                    editBuilder.insert(selection.start, formattedGuid);
                } else {
                    editBuilder.replace(selection, formattedGuid);
                }
            });
        });
    });
    context.subscriptions.push(disposable);
}

/**
* @param {boolean} uppercase 
* @returns {string}
*/
function generateGuid(uppercase) {
    let uuid = crypto.randomUUID();
    
    if (uppercase) {
        uuid = uuid.toUpperCase();
    }
    
    return uuid;
}

/**
* @param {string} guid 
* @param {boolean} includeBraces 
* @param {vscode.Selection} selection 
* @param {vscode.TextEditor} editor 
* @returns {string}
*/
function formatGuid(guid, includeBraces, selection, editor) {
    if (!includeBraces) {
        return guid;
    }

    if (!selection.isEmpty) {
        const document = editor.document;
        const selectedText = document.getText(selection);

        // check if selection is surrounded by braces
        const startLineText = document.lineAt(selection.start.line).text;
        const endLineText = document.lineAt(selection.end.line).text;
        const selStartChar = selection.start.character;
        const selEndChar = selection.end.character;

        const hasBraceBefore = selStartChar > 0 && startLineText[selStartChar - 1] === '{';
        const hasBraceAfter = selEndChar < endLineText.length && endLineText[selEndChar] === '}';
        
        if (hasBraceBefore && hasBraceAfter) {
            return guid; // return a plain guid to fit into existing braces
        }
    }

    return `{${guid}}`;
}

function deactivate() {}

module.exports = {
    activate,
    deactivate,
    // export for testing:
    generateGuid,
    formatGuid
}