import * as vscode from 'vscode';

function config(): vscode.WorkspaceConfiguration {
    return vscode.workspace.getConfiguration('rust-assist');
}

export function checkOnStartup(): boolean {
    return config().get('checkOnStartup', true);
}

export function checkOnSave(): boolean {
    return config().get('checkOnSave', true);
}
