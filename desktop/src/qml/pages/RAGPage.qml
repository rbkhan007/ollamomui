import QtQuick 2.15
import QtQuick.Layouts 1.15
import QtQuick.Controls 2.15

Rectangle {
    color: "transparent"

    property var documents: []
    property var currentChunks: []
    property var stats: ({})

    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 30
        spacing: 16

        RowLayout {
            Layout.fillWidth: true
            spacing: 12

            ColumnLayout {
                Layout.fillWidth: true; spacing: 4
                Text { text: "RAG Knowledge Base"; font: Theme.fontHeading; font.pixelSize: 22; color: Theme.textPrimary }
                Text { text: "Documents: " + (stats.documents || 0) + " | Chunks: " + (stats.chunks || 0) + " | Vectors: " + (stats.vectors || 0); font: Theme.fontBody; color: Theme.textSecondary }
            }

            Button {
                text: "+ Add Text"
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
                text: "Upload File"
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
                title: "Choose a document to index"
                nameFilters: ["Documents (*.pdf *.txt *.md *.docx *.html *.csv)", "All files (*)"]
                onAccepted: {
                    var raw = fileDialog.fileUrl.toString()
                    var path = raw.startsWith("file:///") ? raw.substring(8) : raw
                    window.showLoading(true)
                    try {
                        var result = apiClient.uploadDocument(path)
                        window.showToast("File indexed (" + (result.chunks || 0) + " chunks)", 1)
                        refreshDocuments()
                    } catch(e) {
                        window.showToast("Upload failed: " + e.message, 2)
                    }
                    window.showLoading(false)
                }
            }

            ProgressSpinner {
                id: ragSpinner
                anchors.centerIn: parent
                running: false
                size: 48
            }

            Button {
                text: "\u21BB"
                flat: true; implicitWidth: 40; implicitHeight: 40
                contentItem: Text {
                    text: parent.text; color: Theme.accentPrimary; font.pixelSize: 18
                    horizontalAlignment: Text.AlignHCenter; verticalAlignment: Text.AlignVCenter
                }
                background: Rectangle { radius: Theme.radiusSmall; color: parent.hovered ? Theme.surfaceAlt : "transparent" }
                onClicked: refreshDocuments()
            }
        }

        RowLayout {
            Layout.fillWidth: true; spacing: 12

            Rectangle {
                Layout.fillWidth: true; Layout.preferredHeight: 40; radius: Theme.radiusSmall
                color: Theme.surface; border.color: Theme.border; border.width: 1
                TextInput {
                    id: searchField; anchors.fill: parent; anchors.margins: 10
                    color: Theme.textPrimary; font: Theme.fontBody
                    placeholderText: "Search documents..."; placeholderTextColor: Theme.textMuted
                    verticalAlignment: Text.AlignVCenter
                }
            }

            Button {
                text: "\u2315"; flat: true; implicitWidth: 40; implicitHeight: 40
                contentItem: Text {
                    text: parent.text; color: Theme.accentPrimary; font.pixelSize: 18
                    horizontalAlignment: Text.AlignHCenter; verticalAlignment: Text.AlignVCenter
                }
                background: Rectangle { radius: Theme.radiusSmall; color: parent.hovered ? Theme.surfaceAlt : "transparent" }
                onClicked: searchDocuments()
            }
        }

        // Document list + chunk viewer split
        RowLayout {
            Layout.fillWidth: true; Layout.fillHeight: true; spacing: 12

            Rectangle {
                Layout.fillWidth: true; Layout.fillHeight: true
                radius: Theme.radiusLarge; color: Theme.surface; border.color: Theme.border; border.width: 1

                ListView {
                    id: docList; anchors.fill: parent; anchors.margins: 8
                    model: documents; spacing: 4; clip: true
                    delegate: Rectangle {
                        width: parent ? parent.width : 0
                        implicitHeight: 64; radius: Theme.radiusSmall
                        color: Theme.bgTertiary

                        RowLayout {
                            anchors.fill: parent; anchors.margins: 10; spacing: 10
                            Text { text: "\u2601"; font.pixelSize: 20; color: Theme.accentPrimary }

                            ColumnLayout {
                                Layout.fillWidth: true; spacing: 2
                                Text {
                                    text: modelData.filename || "Untitled"
                                    font: Theme.fontBody; font.bold: true; color: Theme.textPrimary; elide: Text.ElideRight
                                }
                                Text {
                                    text: "Chunks: " + (modelData.chunks || 0) + " \u00B7 " + (modelData.collection || "default")
                                    font: Theme.fontSmall; color: Theme.textMuted
                                }
                            }

                            Button {
                                text: "Chunks"; flat: true; implicitWidth: 60; implicitHeight: 28
                                contentItem: Text {
                                    text: parent.text; color: Theme.accentSecondary; font: Theme.fontSmall; font.bold: true
                                    horizontalAlignment: Text.AlignHCenter; verticalAlignment: Text.AlignVCenter
                                }
                                background: Rectangle {
                                    radius: Theme.radiusSmall; color: parent.hovered ? Theme.surfaceAlt : "transparent"
                                    border.color: Theme.accentSecondary; border.width: 1
                                }
                                onClicked: viewChunks(modelData.id)
                            }

                            Button {
                                text: "\u2716"; flat: true; implicitWidth: 28; implicitHeight: 28
                                contentItem: Text {
                                    text: parent.text; color: "#ff6b9d"; font.pixelSize: 12
                                    horizontalAlignment: Text.AlignHCenter; verticalAlignment: Text.AlignVCenter
                                }
                                background: Rectangle { radius: 14; color: parent.hovered ? "#ff6b9d22" : "transparent" }
                                onClicked: confirmDeleteDoc(modelData.id, modelData.filename)
                            }
                        }
                    }

                    Text {
                        anchors.centerIn: parent
                        text: "No documents. Add text or upload to get started."
                        font: Theme.fontBody; color: Theme.textMuted; visible: documents.length === 0
                    }
                }
            }

            // Chunk viewer panel
            Rectangle {
                Layout.preferredWidth: currentChunks.length > 0 ? 350 : 0
                Layout.fillHeight: true
                radius: Theme.radiusLarge; color: Theme.surface; border.color: Theme.border; border.width: 1
                visible: currentChunks.length > 0
                clip: true

                ColumnLayout {
                    anchors.fill: parent; spacing: 8
                    anchors.margins: 12

                    RowLayout {
                        Layout.fillWidth: true; spacing: 8
                        Text { text: "Chunks (" + currentChunks.length + ")"; font: Theme.fontSubheading; color: Theme.textPrimary }
                        Item { Layout.fillWidth: true }
                        Button {
                            text: "\u2716"; flat: true; implicitWidth: 24; implicitHeight: 24
                            contentItem: Text {
                                text: parent.text; color: Theme.textMuted; font.pixelSize: 12
                                horizontalAlignment: Text.AlignHCenter; verticalAlignment: Text.AlignVCenter
                            }
                            background: null
                            onClicked: currentChunks = []
                        }
                    }

                    ListView {
                        Layout.fillWidth: true; Layout.fillHeight: true
                        model: currentChunks; spacing: 4; clip: true
                        delegate: Rectangle {
                            width: parent ? parent.width : 0
                            implicitHeight: chunkContent.implicitHeight + 32
                            radius: Theme.radiusSmall; color: Theme.bgTertiary

                            ColumnLayout {
                                anchors.fill: parent; anchors.margins: 10; spacing: 4
                                Text {
                                    text: "Chunk " + (modelData.chunk_index || 0)
                                    font: Theme.fontSmall; font.bold: true; color: Theme.accentSecondary
                                }
                                Text {
                                    id: chunkContent
                                    text: modelData.content || ""
                                    font: Theme.fontSmall; color: Theme.textPrimary; wrapMode: Text.WordWrap
                                    Layout.fillWidth: true; maximumLineCount: 4; elide: Text.ElideRight
                                }
                            }

                            MouseArea {
                                anchors.fill: parent
                                cursorShape: Qt.PointingHandCursor
                                onClicked: editChunkDialog(modelData.id, modelData.content)
                            }
                        }
                    }
                }
            }
        }
    }

    // ── Add Text Dialog ──
    Dialog {
        id: addTextDialog
        title: "Add Text Document"
        standardButtons: Dialog.Ok | Dialog.Cancel
        modal: true
        x: (parent.width - width) / 2; y: (parent.height - height) / 3

        contentItem: ColumnLayout {
            spacing: 10; implicitWidth: 400
            Text { text: "Title"; font: Theme.fontBody; color: Theme.textPrimary }
            TextField {
                id: docTitle; Layout.fillWidth: true; placeholderText: "Document title"
                background: Rectangle { radius: Theme.radiusSmall; color: Theme.surface; border.color: Theme.border; border.width: 1 }
                color: Theme.textPrimary
            }
            Text { text: "Content"; font: Theme.fontBody; color: Theme.textPrimary }
            TextArea {
                id: docContent; Layout.fillWidth: true; Layout.preferredHeight: 200
                placeholderText: "Paste or type document content..."
                background: Rectangle { radius: Theme.radiusSmall; color: Theme.surface; border.color: Theme.border; border.width: 1 }
                color: Theme.textPrimary
            }
        }

        onAccepted: {
            var title = docTitle.text.trim() || "pasted-text"
            var text = docContent.text.trim()
            if (!text) return
            try {
                apiClient.addRagText(text, title)
                docTitle.text = ""; docContent.text = ""
                refreshDocuments()
            } catch(e) {
                console.warn("Upload failed:", e)
            }
        }
    }

    // ── Edit Chunk Dialog ──
    Dialog {
        id: chunkEditDialog
        property string chunkId: ""
        title: "Edit Chunk"
        standardButtons: Dialog.Ok | Dialog.Cancel
        modal: true
        x: (parent.width - width) / 2; y: (parent.height - height) / 3

        contentItem: ColumnLayout {
            spacing: 10; implicitWidth: 500
            Text { text: "Chunk Content"; font: Theme.fontBody; color: Theme.textPrimary }
            TextArea {
                id: chunkEditContent; Layout.fillWidth: true; Layout.preferredHeight: 250
                background: Rectangle { radius: Theme.radiusSmall; color: Theme.surface; border.color: Theme.border; border.width: 1 }
                color: Theme.textPrimary; wrapMode: Text.WordWrap
            }
        }

        onAccepted: {
            var content = chunkEditContent.text.trim()
            if (!content) return
            try {
                apiClient.updateRagChunk(chunkEditDialog.chunkId, content)
                refreshDocuments()
                viewChunks(currentChunks.length > 0 ? currentChunks[0].doc_id : "")
            } catch(e) {
                console.warn("Chunk update failed:", e)
            }
        }
    }

    // ── Delete Confirmation ──
    Dialog {
        id: confirmDocDelete
        property string docId: ""
        property string docName: ""
        title: "Confirm Delete"
        standardButtons: Dialog.Yes | Dialog.No
        modal: true
        x: (parent.width - width) / 2; y: (parent.height - height) / 3
        contentItem: Text {
            text: "Delete document \"" + confirmDocDelete.docName + "\" and all its chunks?"
            font: Theme.fontBody; color: Theme.textPrimary; wrapMode: Text.WordWrap; width: 300
        }
        onAccepted: {
            try {
                apiClient.deleteRagDocument(confirmDocDelete.docId)
                currentChunks = []
                refreshDocuments()
            } catch(e) {
                console.warn("Delete failed:", e)
            }
        }
    }

    function viewChunks(docId) {
        try {
            currentChunks = apiClient.getRagChunks(docId)
        } catch(e) {
            console.warn("Failed to load chunks:", e)
        }
    }

    function editChunkDialog(chunkId, content) {
        chunkEditDialog.chunkId = chunkId
        chunkEditContent.text = content
        chunkEditDialog.open()
    }

    function confirmDeleteDoc(docId, docName) {
        confirmDocDelete.docId = docId
        confirmDocDelete.docName = docName
        confirmDocDelete.open()
    }

    function refreshDocuments() {
        try {
            documents = apiClient.getRagDocuments()
            stats = apiClient.getRagStats()
        } catch(e) {
            console.warn("Failed to load documents:", e)
        }
    }

    function searchDocuments() {
        var query = searchField.text.trim()
        if (!query) { refreshDocuments(); return }
        try {
            documents = apiClient.searchRag(query)
        } catch(e) {
            console.warn("Search failed:", e)
        }
    }

    Component.onCompleted: refreshDocuments()
}
