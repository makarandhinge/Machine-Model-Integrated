import * as vscode from 'vscode';
import * as fs from 'fs';

export function activate(context: vscode.ExtensionContext) {
 // Command to load the ML model
let loadModel = vscode.commands.registerCommand('machineModelIntegrated.loadModel', async () => {
    const options: vscode.OpenDialogOptions = {
        canSelectMany: false,
        openLabel: 'Load Model',
        filters: {
            'Pickle Files': ['pkl'],
            'H5 Files': ['h5'],
            'All Files': ['*']
        }
    };

    try {
        const fileUri = await vscode.window.showOpenDialog(options);
        if (fileUri && fileUri[0]) {
            const modelPath = fileUri[0].fsPath; // Get the selected file path
            fs.access(modelPath, fs.constants.F_OK, (err) => {
                if (err) {
                    vscode.window.showErrorMessage('Error accessing model file: ' + err.message);
                    return;
                }
                vscode.window.showInformationMessage('Model loaded from: ' + modelPath);
                // Logic to load the model can be added here
            });
        }
    } catch (error) {
        // Assert that error is an instance of Error
        const errorMessage = (error instanceof Error) ? error.message : 'Unknown error occurred';
        vscode.window.showErrorMessage('An error occurred while loading the model: ' + errorMessage);
    }
});

    // Command to generate Flask/Spring Boot API
    let generateApi = vscode.commands.registerCommand('machineModelIntegrated.generateApi', async () => {
        const apiOptions = ['Flask', 'Spring Boot'];
        const backend = await vscode.window.showQuickPick(apiOptions, { placeHolder: 'Select Backend' });

        if (backend === 'Flask') {
            const flaskTemplate = `
            from flask import Flask, request, jsonify
            import pickle

            app = Flask(__name__)

            with open('model.pkl', 'rb') as model_file:
                model = pickle.load(model_file)

            @app.route('/predict', methods=['POST'])
            def predict():
                data = request.json
                prediction = model.predict([data])
                return jsonify(prediction=prediction.tolist())

            if __name__ == '__main__':
                app.run(debug=True)
            `;
            writeToFile('flask_app.py', flaskTemplate);
        } else if (backend === 'Spring Boot') {
            const springTemplate = `
            @RestController
            public class PredictController {
                @PostMapping("/predict")
                public ResponseEntity<String> predict(@RequestBody Map<String, Object> data) {
                    // Load the model and make predictions
                    return ResponseEntity.ok("Prediction result");
                }
            }
            `;
            writeToFile('SpringBootApp.java', springTemplate);
        }
    });

    // Command to generate frontend code
    let generateFrontend = vscode.commands.registerCommand('machineModelIntegrated.generateFrontend', async () => {
        const frontendTemplate = `
        const handlePredict = async (inputData) => {
            const response = await fetch('/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(inputData),
            });
            const result = await response.json();
            console.log(result.prediction);
        };
        `;
        writeToFile('frontend.js', frontendTemplate);
        vscode.window.showInformationMessage('Frontend code generated: frontend.js');
    });

    context.subscriptions.push(loadModel, generateApi, generateFrontend);
}

function writeToFile(fileName: string, content: string) {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
    const filePath = workspaceFolder ? `${workspaceFolder}/${fileName}` : fileName;
    fs.writeFileSync(filePath, content);
    vscode.window.showInformationMessage(`Generated file: ${fileName}`);
}

export function deactivate() {}
