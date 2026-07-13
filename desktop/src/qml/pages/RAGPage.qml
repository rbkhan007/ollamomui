import QtQuick 2.15
import QtQuick.Layouts 1.15
import QtQuick.Controls 2.15
import Qt.labs.platform 1.0
import OllamoMUI 1.0

Rectangle {
    color: "transparent"

    property var documents: []
    property var currentChunks: []
    property var stats: ({})

    Connections {
        target: apiClient
        function onRequestFinished(id, payload) {
            if (id === "ragUpload") {
                window.showLoading(false)
                window.showToast(qsTr("File indexed"), 1)
                refreshDocuments()
            } else if (id === "ragAddText") {
                docTitle.text = ""
                docContent.text = ""
                refreshDocuments()
            }
        }
        function onRequestError(id, msg) {
            if (id === "ragUpload") {
                window.showLoading(false)
                window.showToast(qsTr("Upload failed: ") + msg, 2)
            } else if (id === "ragAddText") {
                window.showToast(qsTr("Add failed: ") + msg, 2)
            }
        }
    }

    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 30
        spacing: 16

        RowLayout {
            Layout.fillWidth: true
            spacing: 12

            ColumnLayout {
                Layout.fillWidth: true; spacing: 4
                Text { text: qsTr("RAG Knowledge Base"); font: Theme.fontHeading; font.pixelSize: 22; color: Theme.textPrimary }
                Text { text: qsTr("Documents: ") + (stats.documents || 0) + " | Chunks: " + (stats.chunks || 0) + " | Vectors: " + (stats.vectors || 0); font: Theme.fontBody; color: Theme.textSecondary }
            }

            Button {
                text: qsTr("+ Add Text")
                flat: true; implicitWidth: 100; implicitHeight: 40
                contentItem: Text {
                    text: parent.text; color: "#ffffff"; font: Theme.fontBody; font.bold: true
                    horizontalAlignment: Text.AlignHCenter; verticalAlignment: Text.AlignVCenter
                }
                background: Rectangle {
                    radius: Theme.radiusMedium
                    gradient: Gradient {
                        GradientStop { position: 0.0; color: Theme.accentPrimary }
                        GradientStop { position: 1.0; color: Theme.accentSecondary }
                    }
                }
                onClicked: addTextDialog.open()
            }

            Button {
                text: qsTr("Upload File")
                flat: true; implicitWidth: 110; implicitHeight: 40
                contentItem: Text {
                    text: parent.text; color: "#ffffff"; font: Theme.fontBody; font.bold: true
                    horizontalAlignment: Text.AlignHCenter; verticalAlignment: Text.AlignVCenter
                }
                background: Rectangle {
                    radius: Theme.radiusMedium
                    gradient: Gradient {
                        GradientStop { position: 0.0; color: Theme.accentSecondary }
                        GradientStop { position: 1.0; color: Theme.accentPrimary }
                    }
                }
                onClicked: fileDialog.open()
            }

            FileDialog {
                id: fileDialog
                title: qsTr("Choose a document to index")
                nameFilters: ["Documents (*.pdf *.txt *.md *.docx *.html *.csv)", "All files (*)"]
                onAccepted: {
                    var raw = fileDialog.fileUrl.toString()
                    var path = raw.startsWith("file:///") ? raw.substring(8) : raw
                    window.showLoading(true)
                    apiClient.executeAsync("ragUpload", "uploadDocument", JSON.stringify([path]), "{}")
                }
            }

            ProgressSpinner {
                id: ragSpinner
                anchors.centerIn: parent
                running: false
                size: 48
            }
        }
    }
}
