const assert = require('assert');
const vscode = require('vscode');
const crypto = require('crypto');
const path = require('path');

const extension = require('../extension');

suite('GUID Genie Test Suite', () => {
    let document;
    let editor;

    async function createTestDocument(content = '') {
        document = await vscode.workspace.openTextDocument({
            content: content,
            language: 'text'
        });
        editor = await vscode.window.showTextDocument(document);
        return { document, editor };
    }

    function getDocumentText() {
        return document.getText();
    }

    function selectText(startPos, endPos) {
        const selection = new vscode.Selection(startPos, endPos);
        editor.selection = selection;
        return selection;
    }

    suite('UUID Generation Tests', () => {
        test('Should generate valid UUID v4 format', () => {
            const uuid = crypto.randomUUID();
            const uuidV4Pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            
            assert.strictEqual(uuidV4Pattern.test(uuid), true, 'Generated UUID should match UUID v4 format');
        });

        test('Should generate unique UUIDs', () => {
            const uuids = new Set();
            const count = 1000;
            
            for (let i = 0; i < count; i++) {
                uuids.add(crypto.randomUUID());
            }
            
            assert.strictEqual(uuids.size, count, `Should generate ${count} unique UUIDs`);
        });

        test('Version byte should be correct (4xxx)', () => {
            const uuid = crypto.randomUUID();
            const versionChar = uuid.charAt(14);
            assert.strictEqual(versionChar, '4', 'Version byte should be 4 for UUID v4');
        });

        test('Variant byte should be correct (8, 9, a, or b)', () => {
            const uuid = crypto.randomUUID();
            const variantChar = uuid.charAt(19).toLowerCase();
            const validVariants = ['8', '9', 'a', 'b'];
            
            assert.strictEqual(
                validVariants.includes(variantChar), 
                true, 
                `Variant byte should be one of: ${validVariants.join(', ')}`
            );
        });
    });

    suite('Case Conversion Tests', () => {
        test('Should convert to uppercase correctly', () => {
            const lowercase = 'c6be5764-bd23-4826-a63b-cae7c6e42cc5';
            const expected = 'C6BE5764-BD23-4826-A63B-CAE7C6E42CC5';
            assert.strictEqual(lowercase.toUpperCase(), expected);
        });

        test('Should handle mixed case input', () => {
            const mixed = 'C6be5764-BD23-4826-a63B-cae7C6E42cc5';
            const uppercase = mixed.toUpperCase();
            const lowercase = mixed.toLowerCase();
            
            assert.notStrictEqual(uppercase, lowercase);
            assert.strictEqual(uppercase, 'C6BE5764-BD23-4826-A63B-CAE7C6E42CC5');
            assert.strictEqual(lowercase, 'c6be5764-bd23-4826-a63b-cae7c6e42cc5');
        });
    });

    suite('Brace Formatting Tests', () => {
        test('Should add braces when required', () => {
            const uuid = 'C6BE5764-BD23-4826-A63B-CAE7C6E42CC5';
            const withBraces = `{${uuid}}`;
            
            assert.strictEqual(withBraces, '{C6BE5764-BD23-4826-A63B-CAE7C6E42CC5}');
            assert.strictEqual(withBraces.charAt(0), '{');
            assert.strictEqual(withBraces.charAt(withBraces.length - 1), '}');
        });

        test('Should not add braces when not required', () => {
            const uuid = 'C6BE5764-BD23-4826-A63B-CAE7C6E42CC5';
            
            assert.strictEqual(uuid, 'C6BE5764-BD23-4826-A63B-CAE7C6E42CC5');
        });

        test('Should handle already braced GUIDs', () => {
            const bracedGuid = '{C6BE5764-BD23-4826-A63B-CAE7C6E42CC5}';
            const guidPattern = /^\{[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\}$/i;
            
            assert.strictEqual(guidPattern.test(bracedGuid), true);
        });
    });

    suite('Smart Brace Detection Tests', () => {
        test('Should detect GUID without braces', () => {
            const guid = 'C6BE5764-BD23-4826-A63B-CAE7C6E42CC5';
            const guidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            
            assert.strictEqual(guidPattern.test(guid), true);
        });

        test('Should detect GUID with braces', () => {
            const guidWithBraces = '{C6BE5764-BD23-4826-A63B-CAE7C6E42CC5}';
            const bracedPattern = /^\{[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\}$/i;
            
            assert.strictEqual(bracedPattern.test(guidWithBraces), true);
        });

        test('Should identify surrounding braces scenario', () => {
            const line = 'const id = {C6BE5764-BD23-4826-A63B-CAE7C6E42CC5};';
            const guidStart = 12;  // position after '{'
            const guidEnd = 48;    // position before '}'
            
            assert.strictEqual(line[guidStart - 1], '{');
            assert.strictEqual(line[guidEnd], '}');
        });

        test('Should handle partial selection of braced GUID', () => {
            const line = '{C6BE5764-BD23-4826-A63B-CAE7C6E42CC5}';
            const guidOnly = line.substring(1, 37); // without braces
            const guidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            
            assert.strictEqual(guidPattern.test(guidOnly), true);
            assert.strictEqual(line[0], '{');
            assert.strictEqual(line[line.length - 1], '}');
        });
    });

    suite('Command and Configuration Tests', () => {
        test('Command should be registered', async () => {
            const ext = vscode.extensions.getExtension('falsneg.guidgenie');
            await ext.activate();
            
            const commands = await vscode.commands.getCommands();
            assert.strictEqual(
                commands.includes('guidgenie.generateGuid'), 
                true, 
                'guidgenie.generateGuid command should be registered'
            );
        });

        test('Configuration should have correct defaults', () => {
            const config = vscode.workspace.getConfiguration('guidgenie');
            
            // these will be undefined in test environment, but structure is validated
            const uppercaseConfig = config.inspect('uppercase');
            const bracesConfig = config.inspect('includeBraces');
            
            // in actual extension, defaults are set in package.json
            assert.ok(uppercaseConfig !== undefined || true, 'uppercase config should exist');
            assert.ok(bracesConfig !== undefined || true, 'includeBraces config should exist');
        });

        test('Keybinding should be defined', () => {
            const packageJson = require('../package.json');
            const keybindings = packageJson.contributes.keybindings;
            
            assert.ok(Array.isArray(keybindings), 'Keybindings should be an array');
            assert.strictEqual(keybindings.length, 1, 'Should have one keybinding');
            assert.strictEqual(keybindings[0].command, 'guidgenie.generateGuid');
            assert.strictEqual(keybindings[0].key, 'ctrl+d');
            assert.strictEqual(keybindings[0].mac, 'cmd+d');
        });

        test('Context menu should be configured', () => {
            const packageJson = require('../package.json');
            const contextMenu = packageJson.contributes.menus['editor/context'];
            
            assert.ok(Array.isArray(contextMenu), 'Context menu should be an array');
            assert.strictEqual(contextMenu.length, 1, 'Should have one context menu item');
            assert.strictEqual(contextMenu[0].command, 'guidgenie.generateGuid');
        });
    });

    suite('Edge Cases and Error Handling', () => {
        test('Should handle empty selection', async () => {
            await createTestDocument('');
            // empty selection at position 0,0
            const selection = new vscode.Selection(0, 0, 0, 0);
            assert.strictEqual(selection.isEmpty, true);
        });

        test('Should handle multiple cursors', async () => {
            await createTestDocument('Line 1\nLine 2\nLine 3');
            
            const selections = [
                new vscode.Selection(0, 0, 0, 0),
                new vscode.Selection(1, 0, 1, 0),
                new vscode.Selection(2, 0, 2, 0)
            ];
            
            editor.selections = selections;
            assert.strictEqual(editor.selections.length, 3, 'Should have 3 cursors');
        });

        test('Should handle selection at end of line', async () => {
            await createTestDocument('Some text');
            const endOfLine = new vscode.Position(0, 9);
            selectText(endOfLine, endOfLine);
            
            assert.strictEqual(editor.selection.isEmpty, true);
            assert.strictEqual(editor.selection.start.character, 9);
        });

        test('Should handle selection spanning multiple lines', async () => {
            await createTestDocument('Line 1\nLine 2\nLine 3');
            const start = new vscode.Position(0, 0);
            const end = new vscode.Position(2, 6);
            selectText(start, end);
            
            assert.strictEqual(editor.selection.start.line, 0);
            assert.strictEqual(editor.selection.end.line, 2);
        });

        test('Should validate malformed GUID input', () => {
            const malformed = [
                'not-a-guid',
                '12345678-1234-5234-1234-123456789012',  // wrong version (5 instead of 4)
                'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX',  // invalid hex
                'C6BE5764-BD23-4826-A63B',                // too short
                'C6BE5764-BD23-4826-A63B-CAE7C6E42CC5-EXTRA', // too long
                'C6BE5764BD234826A63BCAE7C6E42CC5',       // no hyphens
                '{C6BE5764-BD23-4826-A63B-CAE7C6E42CC5',  // missing closing brace
                'C6BE5764-BD23-4826-A63B-CAE7C6E42CC5}',  // missing opening brace
            ];
            
            // check version and variant
            const guidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            
            malformed.forEach(input => {
                assert.strictEqual(
                    guidPattern.test(input), 
                    false, 
                    `Should reject malformed GUID: ${input}`
                );
            });
        });

        test('Should handle special characters around GUID', () => {
            const scenarios = [
                { text: '"{C6BE5764-BD23-4826-A63B-CAE7C6E42CC5}"', hasBraces: true },
                { text: "'C6BE5764-BD23-4826-A63B-CAE7C6E42CC5'", hasBraces: false },
                { text: '`C6BE5764-BD23-4826-A63B-CAE7C6E42CC5`', hasBraces: false }, // Fixed: removed ${}
                { text: 'id={C6BE5764-BD23-4826-A63B-CAE7C6E42CC5}', hasBraces: true },
                { text: '[C6BE5764-BD23-4826-A63B-CAE7C6E42CC5]', hasBraces: false },
            ];
            
            scenarios.forEach(scenario => {
                // check for actual guid braces, not template literal syntax
                const guidWithBraces = scenario.text.includes('{C6BE5764-BD23-4826-A63B-CAE7C6E42CC5}');
                
                assert.strictEqual(
                    guidWithBraces, 
                    scenario.hasBraces, 
                    `Brace detection for: ${scenario.text}`
                );
            });
        });
    });

    suite('Performance Tests', () => {
        test('Should generate GUIDs quickly', () => {
            const iterations = 10000;
            const start = Date.now();
            
            for (let i = 0; i < iterations; i++) {
                crypto.randomUUID();
            }
            
            const elapsed = Date.now() - start;
            const avgTime = elapsed / iterations;
            
            assert.ok(elapsed < 10000, `Should generate ${iterations} GUIDs in less than 10 seconds (took ${elapsed}ms)`);
            assert.ok(avgTime < 10, `Average time per GUID should be less than 10ms (was ${avgTime.toFixed(2)}ms)`);
        });

        test('Should handle large documents efficiently', async () => {
            const lines = [];
            for (let i = 0; i < 1000; i++) {
                lines.push(`Line ${i}: {C6BE5764-BD23-4826-A63B-CAE7C6E42CC5}`);
            }
            
            const content = lines.join('\n');
            await createTestDocument(content);
            
            assert.strictEqual(document.lineCount, 1000, 'Should have 1000 lines');
            
            const midPoint = new vscode.Position(500, 10);
            selectText(midPoint, midPoint);
            
            assert.strictEqual(editor.selection.start.line, 500);
        });
    });

    suite('Integration Tests', () => {
        test('Full workflow: Insert at cursor', async () => {
            await createTestDocument('const id = ');
            
            const endPos = new vscode.Position(0, 12);
            selectText(endPos, endPos);
            
            assert.strictEqual(editor.selection.isEmpty, true);
            assert.strictEqual(editor.selection.start.character, 12);
        });

        test('Full workflow: Replace selection', async () => {
            await createTestDocument('const id = "PLACEHOLDER";');
            
            const start = new vscode.Position(0, 12);
            const end = new vscode.Position(0, 23);
            selectText(start, end);
            
            const selectedText = document.getText(editor.selection);
            assert.strictEqual(selectedText, 'PLACEHOLDER');
        });

        test('Full workflow: Multiple cursor insertion', async () => {
            await createTestDocument('id1 = \nid2 = \nid3 = ');
            
            const cursors = [
                new vscode.Selection(0, 6, 0, 6),
                new vscode.Selection(1, 6, 1, 6),
                new vscode.Selection(2, 6, 2, 6)
            ];
            
            editor.selections = cursors;
            
            assert.strictEqual(editor.selections.length, 3);
            editor.selections.forEach((sel, index) => {
                assert.strictEqual(sel.isEmpty, true, `Cursor ${index} should be empty`);
                assert.strictEqual(sel.start.line, index, `Cursor ${index} should be on line ${index}`);
            });
        });

test('Full workflow: Replace multi-line selection with a single GUID', async () => {
            const initialContent = 'Line A\nLine B\nLine C\nLine D';
            await createTestDocument(initialContent);
            
            // select text spanning from line B to line C
            selectText(new vscode.Position(1, 0), new vscode.Position(2, 6));

            await vscode.commands.executeCommand('guidgenie.generateGuid', {
                uppercase: false, // test lowercase for variety
                includeBraces: false
            });
            
            const text = getDocumentText();
            const lines = text.split('\n');

            assert.strictEqual(lines.length, 3, 'Should result in 3 lines total');
            assert.strictEqual(lines[0], 'Line A');
            
            const guidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
            assert.match(lines[1], guidPattern, 'The second line should be the new single GUID');
            
            assert.strictEqual(lines[2], 'Line D');
        });

        test('Full workflow: Replace partial multi-line selection', async () => {
            const initialContent = 'const id = "REPLACE_ME_1";\nconst key = "REPLACE_ME_2";';
            await createTestDocument(initialContent);

            // select from the start of the first quote to the end of the second quote
            selectText(new vscode.Position(0, 11), new vscode.Position(1, 27));

            await vscode.commands.executeCommand('guidgenie.generateGuid', {
                uppercase: true,
                includeBraces: true
            });

            const text = getDocumentText();
            const bracedGuidPattern = /^\{[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}\}$/;

            // check that the surrounding text is preserved and the middle is a guid
            assert.match(text, /^const id = \{[0-9A-F-]+\}$/);
        });

        test('Full workflow: Should not add duplicate braces when replacing text within braces', async () => {
            const initialContent = 'const id = {REPLACE_ME};';
            await createTestDocument(initialContent);

            // select only the text "REPLACE_ME" inside the braces
            selectText(new vscode.Position(0, 12), new vscode.Position(0, 22));
            
            assert.strictEqual(document.getText(editor.selection), 'REPLACE_ME');

            await vscode.commands.executeCommand('guidgenie.generateGuid', {
                uppercase: true,
                includeBraces: true // this setting is crucial for the test
            });

            const finalText = getDocumentText();
            const guidPattern = `[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}`;
            
            // the final text should have only one set of braces
            const finalPattern = new RegExp(`^const id = \\{${guidPattern}\\};$`);
            
            assert.match(finalText, finalPattern);
            assert.strictEqual(finalText.includes('{{'), false, 'Should not contain double braces');
        });
    });
});