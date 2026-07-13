import QtQuick 2.15
import QtQuick.Layouts 1.15
import QtQuick.Controls 2.15
import OllamoMUI 1.0

Rectangle {
    color: "transparent"

    property var messages: []
    property var facts: []
    property var sessions: []
    property var memoryStats: ({})

    property int activeTab: 0

    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 30
        spacing: 16

        RowLayout {
            Layout.fillWidth: true; spacing: 12

            ColumnLayout {
                Layout.fillWidth: true; spacing: 4
                Text { text: qsTr("Conversation Memory"); font: Theme.fontHeading; font.pixelSize: 22; color: Theme.textPrimary }
                Text { text: qsTr("Messages: ") + (memoryStats.messages || 0) + " | Facts: " + (memoryStats.facts || 0) + " | Sessions: " + (memoryStats.sessions || 0); font: Theme.fontBody; color: Theme.textSecondary }
            }

            Button {
                text: "\u21BB"; flat: true; implicitWidth: 40; implicitHeight: 40
                contentItem: Text {
                    text: parent.text; color: Theme.accentPrimary; font.pixelSize: 18
                    horizontalAlignment: Text.AlignHCenter; verticalAlignment: Text.AlignVCenter
                }
                background: Rectangle { radius: Theme.radiusSmall; color: parent.hovered ? Theme.surfaceAlt : "transparent" }
                onClicked: refreshAll()
            }
        }

        Rectangle {
            Layout.fillWidth: true; Layout.preferredHeight: 40; radius: Theme.radiusMedium
            color: Theme.bgSecondary

            RowLayout {
                anchors.fill: parent; spacing: 2; anchors.margins: 2

                Repeater {
                    model: ["Messages", "Facts", "Sessions"]

                    Rectangle {
                        Layout.fillWidth: true; Layout.fillHeight: true; radius: Theme.radiusSmall
                        color: activeTab === index ? Theme.accentPrimary : "transparent"
                        Behavior on color { ColorAnimation { duration: 150 } }

                        Text {
                            anchors.centerIn: parent
                            text: modelData
                            font: Theme.fontBody; font.bold: activeTab === index
                            color: activeTab === index ? "#ffffff" : Theme.textSecondary
                        }

                        HoverHandler { cursorShape: Qt.PointingHandCursor }
                        TapHandler {
                            onTapped: {
                                activeTab = index
                                refreshAll()
                            }
                        }
                    }
                }
            }
        }

        RowLayout {
            Layout.fillWidth: true; spacing: 12; visible: activeTab !== 2
            Rectangle {
                Layout.fillWidth: true; Layout.preferredHeight: 40; radius: Theme.radiusSmall
                color: Theme.surface; border.color: Theme.border; border.width: 1
                TextInput {
                    id: memorySearch; anchors.fill: parent; anchors.margins: 10
                    color: Theme.textPrimary; font: Theme.fontBody
                    placeholderText: activeTab === 0 ? "Search messages..." : "Search facts..."
                    placeholderTextColor: Theme.textMuted; verticalAlignment: Text.AlignVCenter
                }
            }
            Button {
                text: "\u2315"; flat: true; implicitWidth: 40; implicitHeight: 40
                contentItem: Text {
                    text: parent.text; color: Theme.accentPrimary; font.pixelSize: 18
                    horizontalAlignment: Text.AlignHCenter; verticalAlignment: Text.AlignVCenter
                }
                background: Rectangle { radius: Theme.radiusSmall; color: parent.hovered ? Theme.surfaceAlt : "transparent" }
                onClicked: {
                    if (activeTab === 0) searchMessages()
                    else searchFacts()
                }
            }
        }

        Rectangle {
            Layout.fillWidth: true; Layout.fillHeight: true
            radius: Theme.radiusLarge; color: Theme.surface; border.color: Theme.border; border.width: 1
            visible: activeTab === 0

            ColumnLayout {
                anchors.fill: parent; spacing: 0

                RowLayout {
                    Layout.fillWidth: true; spacing: 8; anchors.margins: 12
                    visible: messages.length > 0
                    Text { text: qsTr("Messages (") + messages.length + ")"; font: Theme.fontSubheading; color: Theme.textPrimary }
                    Item { Layout.fillWidth: true }
                    Button {
                        text: qsTr("Clear All"); flat: true; implicitWidth: 80; implicitHeight: 30
                        contentItem: Text {
                            text: parent.text; color: "#ff6b9d"; font: Theme.fontSmall; font.bold: true
                            horizontalAlignment: Text.AlignHCenter; verticalAlignment: Text.AlignVCenter
                        }
                        background: Rectangle {
                            radius: Theme.radiusSmall; color: parent.hovered ? "#ff6b9d22" : "transparent"
                            border.color: "#ff6b9d"; border.width: 1
                        }
                        onClicked: confirmClearMessages.open()
                    }
                }

                ListView {
                    Layout.fillWidth: true; Layout.fillHeight: true
                    model: messages; spacing: 4; clip: true; anchors.margins: 4
                    delegate: Rectangle {
                        width: parent ? parent.width : 0
                        implicitHeight: 60; radius: Theme.radiusSmall
                        color: Theme.bgTertiary

                        RowLayout {
                            anchors.fill: parent; anchors.margins: 10; spacing: 10

                            Text {
                                text: modelData.role === "user" ? "\u263A" : "\u2699"
                                font.pixelSize: 18
                                color: modelData.role === "user" ? Theme.accentPrimary : Theme.accentSecondary
                            }

                            ColumnLayout {
                                Layout.fillWidth: true; spacing: 2
                                Text {
                                    text: (modelData.content || "").substring(0, 120) + ((modelData.content || "").length > 120 ? "..." : "")
                                    font: Theme.fontBody; color: Theme.textPrimary; elide: Text.ElideRight
                                }
                                Text {
                                    text: (modelData.role || "") + " \u00B7 " + (modelData.model || "") + " \u00B7 " + (modelData.created_at ? new Date(modelData.created_at).toLocaleString() : "")
                                    font: Theme.fontSmall; color: Theme.textMuted
                                }
                            }

                            Button {
                                text: "\u2716"; flat: true; implicitWidth: 28; implicitHeight: 28
                                contentItem: Text {
                                    text: parent.text; color: "#ff6b9d"; font.pixelSize: 12
                                    horizontalAlignment: Text.AlignHCenter; verticalAlignment: Text.AlignVCenter
                                }
                                background: Rectangle { radius: 14; color: parent.hovered ? "#ff6b9d22" : "transparent" }
                                onClicked: confirmDeleteMsg(modelData.id, model.index)
                            }
                        }
                    }

                    Text {
                        anchors.centerIn: parent
                        text: qsTr("No messages yet.")
                        font: Theme.fontBody; color: Theme.textMuted; visible: messages.length === 0
                    }
                }
            }
        }

        Rectangle {
            Layout.fillWidth: true; Layout.fillHeight: true
            radius: Theme.radiusLarge; color: Theme.surface; border.color: Theme.border; border.width: 1
            visible: activeTab === 1

            ColumnLayout {
                anchors.fill: parent; spacing: 0

                RowLayout {
                    Layout.fillWidth: true; spacing: 8; anchors.margins: 12
                    visible: facts.length > 0
                    Text { text: qsTr("Facts (") + facts.length + ")"; font: Theme.fontSubheading; color: Theme.textPrimary }
                    Item { Layout.fillWidth: true }
                    Button {
                        text: qsTr("+ Add Fact"); flat: true; implicitWidth: 90; implicitHeight: 30
                        contentItem: Text {
                            text: parent.text; color: Theme.accentSecondary; font: Theme.fontSmall; font.bold: true
                            horizontalAlignment: Text.AlignHCenter; verticalAlignment: Text.AlignVCenter
                        }
                        background: Rectangle {
                            radius: Theme.radiusSmall; color: parent.hovered ? Theme.surfaceAlt : "transparent"
                            border.color: Theme.accentSecondary; border.width: 1
                        }
                        onClicked: addFactDialog.open()
                    }
                }

                ListView {
                    Layout.fillWidth: true; Layout.fillHeight: true
                    model: facts; spacing: 4; clip: true; anchors.margins: 4
                    delegate: Rectangle {
                        width: parent ? parent.width : 0
                        implicitHeight: 56; radius: Theme.radiusSmall
                        color: Theme.bgTertiary

                        RowLayout {
                            anchors.fill: parent; anchors.margins: 10; spacing: 10

                            Text {
                                text: "\u2749"; font.pixelSize: 18; color: Theme.accentTertiary
                            }

                            ColumnLayout {
                                Layout.fillWidth: true; spacing: 2
                                Text {
                                    text: modelData.fact || ""
                                    font: Theme.fontBody; color: Theme.textPrimary; elide: Text.ElideRight
                                }
                                Text {
                                    text: qsTr("Importance: ") + (modelData.importance || "normal") + " \u00B7 " + (modelData.created_at ? new Date(modelData.created_at).toLocaleString() : "")
                                    font: Theme.fontSmall; color: Theme.textMuted
                                }
                            }

                            Button {
                                text: "\u2716"; flat: true; implicitWidth: 28; implicitHeight: 28
                                contentItem: Text {
                                    text: parent.text; color: "#ff6b9d"; font.pixelSize: 12
                                    horizontalAlignment: Text.AlignHCenter; verticalAlignment: Text.AlignVCenter
                                }
                                background: Rectangle { radius: 14; color: parent.hovered ? "#ff6b9d22" : "transparent" }
                                onClicked: confirmDeleteFact(modelData.id, model.index)
                            }
                        }
                    }

                    Text {
                        anchors.centerIn: parent
                        text: qsTr("No facts stored. Add one to persist knowledge.")
                        font: Theme.fontBody; color: Theme.textMuted; visible: facts.length === 0
                    }
                }
            }
        }

        Rectangle {
            Layout.fillWidth: true; Layout.fillHeight: true
            radius: Theme.radiusLarge; color: Theme.surface; border.color: Theme.border; border.width: 1
            visible: activeTab === 2

            ListView {
                anchors.fill: parent; anchors.margins: 8
                model: sessions; spacing: 4; clip: true
                delegate: Rectangle {
                    width: parent ? parent.width : 0
                    implicitHeight: 56; radius: Theme.radiusSmall
                    color: Theme.bgTertiary

                    RowLayout {
                        anchors.fill: parent; anchors.margins: 12; spacing: 12

                        Text { text: "\u2630"; font.pixelSize: 18; color: Theme.accentSecondary }

                        ColumnLayout {
                            Layout.fillWidth: true; spacing: 2
                            Text {
                                text: modelData.name || modelData.id || "Session"
                                font: Theme.fontBody; font.bold: true; color: Theme.textPrimary; elide: Text.ElideRight
                            }
                            Text {
                                text: qsTr("Messages: ") + (modelData.message_count || 0) + " \u00B7 " + (modelData.model || "") + " \u00B7 " + (modelData.updated_at ? new Date(modelData.updated_at).toLocaleString() : "")
                                font: Theme.fontSmall; color: Theme.textMuted
                            }
                        }
                    }
                }

                Text {
                    anchors.centerIn: parent
                    text: qsTr("No sessions yet.")
                    font: Theme.fontBody; color: Theme.textMuted; visible: sessions.length === 0
                }
            }
        }
    }

    Dialog {
        id: addFactDialog
        title: qsTr("Add Fact")
        standardButtons: Dialog.Ok | Dialog.Cancel
        modal: true
        x: (parent.width - width) / 2; y: (parent.height - height) / 3

        contentItem: ColumnLayout {
            spacing: 10; implicitWidth: 400
            Text { text: qsTr("Fact"); font: Theme.fontBody; color: Theme.textPrimary }
            TextArea {
                id: factContent; Layout.fillWidth: true; Layout.preferredHeight: 100
                placeholderText: qsTr("What should the AI remember?")
                background: Rectangle { radius: Theme.radiusSmall; color: Theme.surface; border.color: Theme.border; border.width: 1 }
                color: Theme.textPrimary
            }
            Text { text: qsTr("Importance"); font: Theme.fontBody; color: Theme.textPrimary }
            ComboBox {
                id: factImportance; Layout.fillWidth: true
                model: ["normal", "high", "low"]
                background: Rectangle { radius: Theme.radiusSmall; color: Theme.surface; border.color: Theme.border; border.width: 1 }
                contentItem: Text { text: parent.currentText; color: Theme.textPrimary; font: Theme.fontBody; verticalAlignment: Text.AlignVCenter; leftPadding: 8 }
            }
        }

        onAccepted: {
            var text = factContent.text.trim()
            if (!text) return
            try {
                apiClient.addMemoryFact(text, "", factImportance.currentText)
                factContent.text = ""
                refreshFacts()
            } catch(e) {
                console.warn("Add fact failed:", e)
            }
        }
    }

    Dialog {
        id: confirmDeleteMsgDialog
        property string msgId: ""
        property int msgIndex: -1
        title: qsTr("Confirm Delete")
        standardButtons: Dialog.Yes | Dialog.No
        modal: true
        x: (parent.width - width) / 2; y: (parent.height - height) / 3
        contentItem: Text {
            text: qsTr("Delete this message?"); font: Theme.fontBody; color: Theme.textPrimary
        }
        onAccepted: {
            try {
                apiClient.deleteMemoryMessage(confirmDeleteMsgDialog.msgId)
                refreshMessages()
            } catch(e) {
                console.warn("Delete failed:", e)
            }
        }
    }

    Dialog {
        id: confirmDeleteFactDialog
        property string factId: ""
        property int factIndex: -1
        title: qsTr("Confirm Delete")
        standardButtons: Dialog.Yes | Dialog.No
        modal: true
        x: (parent.width - width) / 2; y: (parent.height - height) / 3
        contentItem: Text {
            text: qsTr("Delete this fact?"); font: Theme.fontBody; color: Theme.textPrimary
        }
        onAccepted: {
            try {
                apiClient.deleteMemoryFact(confirmDeleteFactDialog.factId)
                refreshFacts()
            } catch(e) {
                console.warn("Delete failed:", e)
            }
        }
    }

    Dialog {
        id: confirmClearMessages
        title: qsTr("Confirm Clear All")
        standardButtons: Dialog.Yes | Dialog.No
        modal: true
        x: (parent.width - width) / 2; y: (parent.height - height) / 3
        contentItem: Text {
            text: qsTr("Clear ALL messages? This cannot be undone.")
            font: Theme.fontBody; color: Theme.textPrimary; wrapMode: Text.WordWrap; width: 300
        }
        onAccepted: {
            try {
                apiClient.clearMemoryMessages(true)
                refreshMessages()
            } catch(e) {
                console.warn("Clear failed:", e)
            }
        }
    }

    function refreshMessages() {
        try { messages = apiClient.getMemoryMessages() } catch(e) { console.warn("Failed to load messages:", e) }
    }

    function refreshFacts() {
        try { facts = apiClient.getMemoryFacts() } catch(e) { console.warn("Failed to load facts:", e) }
    }

    function refreshSessions() {
        try { sessions = apiClient.getMemorySessions() } catch(e) { console.warn("Failed to load sessions:", e) }
    }

    function refreshStats() {
        try { memoryStats = apiClient.getMemoryStats() } catch(e) {}
    }

    function refreshAll() {
        refreshStats()
        if (activeTab === 0) refreshMessages()
        else if (activeTab === 1) refreshFacts()
        else if (activeTab === 2) refreshSessions()
    }

    function searchMessages() {
        var query = memorySearch.text.trim()
        if (!query) { refreshMessages(); return }
        try { messages = apiClient.searchMemory(query) } catch(e) { console.warn("Search failed:", e) }
    }

    function searchFacts() {
        var query = memorySearch.text.trim()
        if (!query) { refreshFacts(); return }
        try { facts = apiClient.searchMemory(query) } catch(e) { console.warn("Search failed:", e) }
    }

    function confirmDeleteMsg(msgId, index) {
        confirmDeleteMsgDialog.msgId = msgId
        confirmDeleteMsgDialog.msgIndex = index
        confirmDeleteMsgDialog.open()
    }

    function confirmDeleteFact(factId, index) {
        confirmDeleteFactDialog.factId = factId
        confirmDeleteFactDialog.factIndex = index
        confirmDeleteFactDialog.open()
    }

    Component.onCompleted: refreshAll()
}
