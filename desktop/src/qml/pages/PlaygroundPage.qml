import QtQuick 2.15
import QtQuick.Layouts 1.15
import QtQuick.Controls 2.15

Rectangle {
    color: "transparent"

    property bool isLoading: false

    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 20
        spacing: 12

        RowLayout {
            Layout.fillWidth: true
            spacing: 12

            Text {
                text: "Playground"
                font: Theme.fontHeading
                font.pixelSize: 22
                color: Theme.textPrimary
            }

            ProgressSpinner {
                Layout.preferredWidth: 20; Layout.preferredHeight: 20
                running: parent.parent.isLoading
                color: Theme.accentSecondary
            }

            Item { Layout.fillWidth: true }

            ComboBox {
                id: modelCombo
                Layout.preferredWidth: 250
                currentIndex: -1
                textRole: "display"
                valueRole: "id"

                background: Rectangle {
                    radius: Theme.radiusSmall
                    color: Theme.surface
                    border.color: Theme.border
                    border.width: 1
                }
                contentItem: Text {
                    text: parent.currentIndex >= 0 ? parent.currentText : "Select a model..."
                    color: Theme.textPrimary
                    font: Theme.fontBody
                    verticalAlignment: Text.AlignVCenter
                    leftPadding: 8
                }

                Component.onCompleted: {
                    try {
                        var models = apiClient.getModelList()
                        for (var i = 0; i < models.length; i++) {
                            modelCombo.append({ display: models[i].id || models[i].name, id: models[i].id || models[i].name })
                        }
                        if (models.length > 0) modelCombo.currentIndex = 0
                    } catch(e) {
                        modelCombo.append({ display: "llama3.2:1b (offline)", id: "llama3.2:1b" })
                        modelCombo.currentIndex = 0
                    }
                }
            }
        }

        Rectangle {
            Layout.fillWidth: true
            Layout.fillHeight: true
            radius: Theme.radiusLarge
            color: Theme.surface
            border.color: Theme.border
            border.width: 1

            ScrollView {
                anchors.fill: parent
                anchors.margins: 16
                clip: true

                ListView {
                    id: chatList
                    model: chatModel
                    spacing: 12
                    delegate: ColumnLayout {
                        width: parent ? parent.width : 0
                        spacing: 4

                        Rectangle {
                            Layout.preferredWidth: Math.min(messageWidth + 32, parent.width * 0.75)
                            Layout.alignment: isUser ? Qt.AlignRight : Qt.AlignLeft
                            Layout.leftMargin: isUser ? 0 : 8
                            Layout.rightMargin: isUser ? 8 : 0
                            radius: Theme.radiusMedium
                            color: isUser ? Theme.accentPrimary : Theme.bgTertiary
                            implicitHeight: msgText.implicitHeight + 24

                            property real messageWidth: msgText.implicitWidth + 32

                            Text {
                                id: msgText
                                anchors.fill: parent
                                anchors.margins: 12
                                text: model.message
                                color: isUser ? "#ffffff" : Theme.textPrimary
                                font: Theme.fontBody
                                wrapMode: Text.WordWrap
                            }
                        }

                        Text {
                            Layout.alignment: isUser ? Qt.AlignRight : Qt.AlignLeft
                            Layout.leftMargin: isUser ? 0 : 12
                            Layout.rightMargin: isUser ? 12 : 0
                            text: isUser ? "You" : "Assistant"
                            font: Theme.fontSmall
                            color: Theme.textMuted
                        }
                    }
                }
            }
        }

        Rectangle {
            Layout.fillWidth: true
            Layout.preferredHeight: 56
            radius: Theme.radiusMedium
            color: Theme.surface
            border.color: Theme.border
            border.width: 1

            RowLayout {
                anchors.fill: parent
                anchors.leftMargin: 12
                anchors.rightMargin: 8
                anchors.topMargin: 8
                anchors.bottomMargin: 8
                spacing: 8

                TextArea {
                    id: messageInput
                    Layout.fillWidth: true
                    Layout.fillHeight: true
                    placeholderText: "Type your message..."
                    placeholderTextColor: Theme.textMuted
                    color: Theme.textPrimary
                    font: Theme.fontBody
                    wrapMode: Text.WordWrap
                    background: null
                    onTextChanged: {
                        if (text.length > 4096) text = text.substring(0, 4096)
                    }
                }

                Button {
                    id: sendButton
                    Layout.preferredWidth: 40
                    Layout.preferredHeight: 40
                    flat: true

                    contentItem: Text {
                        text: "\u25B6"
                        color: parent.enabled ? Theme.accentPrimary : Theme.textMuted
                        font.pixelSize: 18
                        horizontalAlignment: Text.AlignHCenter
                        verticalAlignment: Text.AlignVCenter
                    }
                    background: Rectangle {
                        radius: 20
                        color: parent.enabled ? (parent.hovered ? Theme.surfaceAlt : "transparent") : "transparent"
                    }
                    enabled: messageInput.text.trim().length > 0 && !parent.parent.isLoading

                    onClicked: sendMessage()
                }
            }
        }
    }

    Shortcut {
        sequence: "Ctrl+Return"
        enabled: messageInput.activeFocus && messageInput.text.trim().length > 0
        onActivated: sendMessage()
    }

    Shortcut {
        sequence: "Ctrl+N"
        onActivated: {
            chatModel.clear()
            messageInput.text = ""
            messageInput.focus = true
        }
    }

    ListModel { id: chatModel }

    function sendMessage() {
        var text = messageInput.text.trim()
        if (!text || isLoading) return

        isLoading = true
        chatModel.append({ message: text, isUser: true })
        messageInput.text = ""

        var model = modelCombo.currentValue || modelCombo.currentText || "llama3.2:1b"
        var msgs = [{ role: "user", content: text }]

        chatModel.append({ message: "", isUser: false })
        var replyIdx = chatModel.count - 1

        var xhr = new XMLHttpRequest()
        var url = apiClient.base_url + "/v1/chat/completions"
        xhr.open("POST", url, true)
        xhr.setRequestHeader("Content-Type", "application/json")
        if (apiClient.token) {
            xhr.setRequestHeader("Authorization", "Bearer " + apiClient.token)
        }
        var body = JSON.stringify({ model: model, messages: msgs, stream: true })
        xhr.send(body)

        var fullReply = ""

        xhr.onreadystatechange = function() {
            if (xhr.readyState === 3 || xhr.readyState === 4) {
                var raw = xhr.responseText
                var lines = raw.split("\n")
                for (var i = 0; i < lines.length; i++) {
                    var line = lines[i]
                    if (line.indexOf("data: ") === 0) {
                        var jsonStr = line.substring(6).trim()
                        if (jsonStr === "[DONE]" || jsonStr === "") continue
                        try {
                            var parsed = JSON.parse(jsonStr)
                            var delta = parsed.choices && parsed.choices[0] && parsed.choices[0].delta
                            if (delta && delta.content) {
                                fullReply += delta.content
                                chatModel.setProperty(replyIdx, "message", fullReply)
                            }
                        } catch(e) {}
                    }
                }
                if (xhr.readyState === 4) {
                    if (xhr.status !== 200) {
                        chatModel.setProperty(replyIdx, "message", "Error: " + (xhr.statusText || xhr.responseText))
                    }
                    isLoading = false
                }
            }
        }
    }
}
