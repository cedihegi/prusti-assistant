import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
// import * as myExtension from '../extension';
import * as notifier from '../notifier';

const PROJECT_ROOT = path.join(__dirname, "../../");
const DATA_ROOT = path.join(PROJECT_ROOT, "src", "test", "data");
const ASSERT_TRUE = "assert_true.rs";
const ASSERT_FALSE = "assert_false.rs";
const EMPTY = "empty.rs";
const LIB_ASSERT_TRUE = "lib_assert_true.rs";

function log(msg: string) {
    console.log("[UnitTest] " + msg);
}

/**
 * Open a file in the IDE
 *
 * @param fileName
 */
function openFile(fileName: string): Promise<vscode.TextDocument> {
    return new Promise((resolve, reject) => {
        const filePath = path.join(DATA_ROOT, fileName);
        log("Open " + filePath);
        vscode.workspace.openTextDocument(filePath).then(document => {
            vscode.window.showTextDocument(document).then((_) => {
                resolve(document);
            });
        });
    });
}

suite("Extension", () => {
    suiteSetup((done) => {
        // Wait until the extension is active
        notifier.wait(notifier.Event.EndExtensionActivation).then(done);
        openFile(ASSERT_TRUE);
    });

    test("Update Prusti", async () => {
        // FIXME: this might update Prusti while other tests are running...
        const document = await openFile(ASSERT_TRUE);
        await vscode.commands.executeCommand("prusti-assistant.update");
    });

    test("Recognize Rust files", async () => {
        const document = await openFile(ASSERT_TRUE);
        assert.equal(document.languageId, "rust");
    });

    test("Verify empty program", async () => {
        const document = await openFile(EMPTY);
        await vscode.commands.executeCommand("prusti-assistant.verify");
        const diagnostics = vscode.languages.getDiagnostics(document.uri);
        assert.equal(diagnostics.length, 0);
    });

    test("Verify simple correct program", async () => {
        const document = await openFile(ASSERT_TRUE);
        await vscode.commands.executeCommand("prusti-assistant.verify");
        const diagnostics = vscode.languages.getDiagnostics(document.uri);
        assert.equal(diagnostics.length, 0);
    });

    test("Verify simple incorrect program", async () => {
        const document = await openFile(ASSERT_FALSE);
        await vscode.commands.executeCommand("prusti-assistant.verify");
        const diagnostics = vscode.languages.getDiagnostics(document.uri);
        assert.equal(diagnostics.length, 1);
        assert.equal(diagnostics[0].severity, vscode.DiagnosticSeverity.Error);
    });

    test("Verify program without main", async () => {
        const document = await openFile(LIB_ASSERT_TRUE);
        await vscode.commands.executeCommand("prusti-assistant.verify");
        const diagnostics = vscode.languages.getDiagnostics(document.uri);
        assert.equal(diagnostics.length, 0);
    });
});
