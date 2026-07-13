import QtQuick 2.15
import QtQuick.Layouts 1.15
import QtQuick.Controls 2.15
import OllamoMUI 1.0

Rectangle {
    color: "transparent"

    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 30
        spacing: 16

        Text {
            text: qsTr("Terminal")
            font: Theme.fontHeading
            font.pixelSize: 22
            color: Theme.textPrimary
        }

        Text {
            text: qsTr("Direct CLI interface to the OllamoMUI backend.")
            font: Theme.fontBody
            color: Theme.textSecondary
        }

        Rectangle {
            Layout.fillWidth: true
            Layout.fillHeight: true
            radius: Theme.radiusMedium
            color: "#0a0a14"
            border.color: "#1a1a2e"
            border.width: 1
            clip: true

            Flickable {
                anchors.fill: parent
                anchors.margins: 4
                contentHeight: terminalOutput.height + 60

                TextEdit {
                    id: terminalOutput
                    width: parent.width
                    color: "#00d4aa"
                    font: Theme.fontCode
                    font.pixelSize: 13
                    readOnly: true
                    wrapMode: Text.Wrap
                    text: "OllamoMUI Terminal v1.0.4\n" +
                          "Copyright (c) 2024-2026 Rhasan@dev\n" +
                          "Type 'help' for available commands.\n\n" +
                          "> "
                }
            }
        }

        Rectangle {
            Layout.fillWidth: true
            Layout.preferredHeight: 40
            radius: Theme.radiusSmall
            color: "#0a0a14"
            border.color: "#1a1a2e"
            border.width: 1

            TextInput {
                id: terminalInput
                anchors.fill: parent
                anchors.margins: 10
                color: "#00d4aa"
                font: Theme.fontCode
                font.pixelSize: 13
                verticalAlignment: Text.AlignVCenter
                focus: true

                onAccepted: executeCommand(text)
            }
        }
    }

    function executeCommand(cmd) {
        if (!cmd.trim()) return

        terminalOutput.text += cmd + "\n"

        var parts = cmd.trim().split(/\s+/)
        var command = parts[0].toLowerCase()

        switch(command) {
            case "help":
                terminalOutput.text += "  help       Show this help\n" +
                    "  models     List available models\n" +
                    "  providers  List providers\n" +
                    "  status     Backend health check\n" +
                    "  usage      Show usage stats\n" +
                    "  clear      Clear terminal\n"
                break
            case "clear":
                terminalOutput.text = ""
                break
            case "models":
                try {
                    var models = apiClient.getModelList()
                    if (models.length === 0) {
                        terminalOutput.text += "  No models found.\n"
                    } else {
                        for (var i = 0; i < models.length; i++) {
                            terminalOutput.text += "  - " + (models[i].id || models[i].name) + "\n"
                        }
                    }
                } catch(e) {
                    terminalOutput.text += "  Error: " + e.message + "\n"
                }
                break
            case "providers":
                try {
                    var procs = apiClient.getProviders()
                    if (procs.length === 0) {
                        terminalOutput.text += "  No providers found.\n"
                    } else {
                        for (var i = 0; i < procs.length; i++) {
                            terminalOutput.text += "  - " + procs[i].name + "\n"
                        }
                    }
                } catch(e) {
                    terminalOutput.text += "  Error: " + e.message + "\n"
                }
                break
            case "status":
                try {
                    var health = apiClient.healthCheck()
                    terminalOutput.text += "  Status: " + (health.status || "ok") + "\n"
                } catch(e) {
                    terminalOutput.text += "  Backend not reachable: " + e.message + "\n"
                }
                break
            case "usage":
                try {
                    var usage = apiClient.getUsage()
                    terminalOutput.text += "  Requests: " + (usage.total_requests || 0) + "\n" +
                        "  Tokens: " + (usage.total_tokens || 0) + "\n"
                } catch(e) {
                    terminalOutput.text += "  Error: " + e.message + "\n"
                }
                break
            default:
                terminalOutput.text += "  Unknown command: " + command + "\n" +
                    "  Type 'help' for available commands.\n"
        }

        terminalOutput.text += "> "
        terminalInput.text = ""
        terminalOutput.cursorPosition = terminalOutput.text.length
    }
}
