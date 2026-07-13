import QtQuick 2.15
import QtQuick.Layouts 1.15
import QtQuick.Dialogs 1.3
import QtQuick.Controls 2.15
import OllamoMUI 1.0

Rectangle {
    color: "transparent"

    property var providers: []
    property var users: []

    Connections {
        target: apiClient
        function onRequestFinished(id, payload) {
            if (id === "export") {
                window.showLoading(false)
                var r = JSON.parse(payload)
                window.showToast(qsTr("Backup saved (") + r.providers + " providers, " + r.facts + " facts, " + r.messages + " messages, " + r.documents + " docs)", 1)
            } else if (id === "import") {
                window.showLoading(false)
                var ri = JSON.parse(payload)
                window.showToast(qsTr("Imported: ") + ri.providers + " providers, " + ri.facts + " facts, " + ri.messages + " messages, " + ri.documents + " docs", 1)
                refreshProviders()
            }
        }
        function onRequestError(id, msg) {
            if (id === "export" || id === "import") {
                window.showLoading(false)
                window.showToast((id === "export" ? "Export" : "Import") + " failed: " + msg, 2)
            }
        }
    }

    Flickable {
        anchors.fill: parent
        contentHeight: settingsColumn.height + 60
        clip: true
        boundsBehavior: Flickable.StopAtBounds

        ColumnLayout {
            id: settingsColumn
            width: parent.width - 60
            anchors.horizontalCenter: parent.horizontalCenter
            spacing: 24

            Item { Layout.preferredHeight: 10 }

            RowLayout {
                Layout.fillWidth: true
                spacing: 12

                ColumnLayout {
                    Layout.fillWidth: true
                    spacing: 4
                    Text {
                        text: qsTr("Settings")
                        font: Theme.fontHeading
                        font.pixelSize: 22
                        color: Theme.textPrimary
                    }
                    Text {
                        text: qsTr("Manage providers, users, and application preferences.")
                        font: Theme.fontBody
                        color: Theme.textSecondary
                    }
                }

                Button {
                    text: qsTr("+ Add Provider")
                    flat: true
                    implicitWidth: 130
                    implicitHeight: 40
                    contentItem: Text {
                        text: parent.text
                        color: "#ffffff"
                        font: Theme.fontBody
                        font.bold: true
                        horizontalAlignment: Text.AlignHCenter
                        verticalAlignment: Text.AlignVCenter
                    }
                    background: Rectangle {
                        radius: Theme.radiusMedium
                        gradient: Gradient {
                            GradientStop { position: 0.0; color: Theme.accentPrimary }
                            GradientStop { position: 1.0; color: Theme.accentSecondary }
                        }
                    }
                    onClicked: openAddProviderDialog()
                }
            }

            SettingsSection {
                title: qsTr("Providers (") + providers.length + ")"
                Layout.fillWidth: true

                ListView {
                    id: providerList
                    Layout.fillWidth: true
                    Layout.preferredHeight: Math.min(providers.length * 60 + 8, 300)
                    model: providers
                    spacing: 4
                    clip: true

                    delegate: Rectangle {
                        width: parent ? parent.width : 0
                        implicitHeight: 56
                        radius: Theme.radiusSmall
                        color: Theme.bgTertiary

                        RowLayout {
                            anchors.fill: parent
                            anchors.margins: 12
                            spacing: 12

                            Text {
                                text: "\u2699"
                                font.pixelSize: 18
                                color: Theme.accentPrimary
                            }

                            ColumnLayout {
                                Layout.fillWidth: true
                                spacing: 2

                                Text {
                                    text: modelData.name || "Unknown"
                                    font: Theme.fontBody
                                    font.bold: true
                                    color: Theme.textPrimary
                                }
                                Text {
                                    text: (modelData.type || "") + " \u00B7 " + (modelData.api_key_set ? "Key set" : "No key")
                                    font: Theme.fontSmall
                                    color: Theme.textMuted
                                }
                            }

                            Button {
                                text: qsTr("Edit")
                                flat: true
                                implicitWidth: 60
                                implicitHeight: 30
                                contentItem: Text {
                                    text: parent.text
                                    color: Theme.accentPrimary
                                    font: Theme.fontSmall
                                    font.bold: true
                                    horizontalAlignment: Text.AlignHCenter
                                    verticalAlignment: Text.AlignVCenter
                                }
                                background: Rectangle {
                                    radius: Theme.radiusSmall
                                    color: parent.hovered ? Theme.surfaceAlt : "transparent"
                                    border.color: Theme.accentPrimary
                                    border.width: 1
                                }
                                onClicked: openEditProviderDialog(model.index)
                            }

                            Button {
                                text: "\u2716"
                                flat: true
                                implicitWidth: 30
                                implicitHeight: 30
                                contentItem: Text {
                                    text: parent.text
                                    color: "#ff6b9d"
                                    font.pixelSize: 14
                                    horizontalAlignment: Text.AlignHCenter
                                    verticalAlignment: Text.AlignVCenter
                                }
                                background: Rectangle {
                                    radius: 15
                                    color: parent.hovered ? "#ff6b9d22" : "transparent"
                                }
                                onClicked: confirmDeleteProvider(modelData.name, model.index)
                            }
                        }
                    }

                    Text {
                        anchors.centerIn: parent
                        text: qsTr("No providers. Add one to get started.")
                        font: Theme.fontBody
                        color: Theme.textMuted
                        visible: providers.length === 0
                    }
                }
            }

            SettingsSection {
                title: qsTr("Server")
                Layout.fillWidth: true

                RowLayout {
                    Layout.fillWidth: true
                    spacing: 12
                    Text { text: qsTr("API Endpoint"); font: Theme.fontBody; color: Theme.textPrimary; Layout.preferredWidth: 150 }
                    Rectangle {
                        Layout.fillWidth: true; Layout.preferredHeight: 36; radius: Theme.radiusSmall
                        color: Theme.surface; border.color: Theme.border; border.width: 1
                        TextInput {
                            anchors.fill: parent; anchors.margins: 8
                            text: apiClient.base_url; color: Theme.textPrimary; font: Theme.fontBody; verticalAlignment: Text.AlignVCenter
                        }
                    }
                }
            }

            SettingsSection {
                title: qsTr("Appearance")
                Layout.fillWidth: true

                RowLayout {
                    Layout.fillWidth: true; spacing: 12
                    Text { text: qsTr("Dark Mode"); font: Theme.fontBody; color: Theme.textPrimary; Layout.fillWidth: true }
                    ThemeSwitch { checked: themeManager.darkTheme; onToggled: themeManager.darkTheme = checked }
                }
            }

            SettingsSection {
                title: qsTr("Account")
                Layout.fillWidth: true

                ColumnLayout {
                    Layout.fillWidth: true; spacing: 12

                    RowLayout {
                        Layout.fillWidth: true; spacing: 12
                        Text { text: qsTr("Email"); font: Theme.fontBody; color: Theme.textPrimary; Layout.preferredWidth: 150 }
                        Rectangle {
                            Layout.fillWidth: true; Layout.preferredHeight: 36; radius: Theme.radiusSmall
                            color: Theme.surface; border.color: Theme.border; border.width: 1
                            TextInput {
                                anchors.fill: parent; anchors.margins: 8
                                text: apiClient.token ? "user@example.com" : "Not logged in"
                                color: Theme.textSecondary; font: Theme.fontBody; readOnly: true; verticalAlignment: Text.AlignVCenter
                            }
                        }
                    }

                    Button {
                        text: qsTr("Change Password"); flat: true; implicitWidth: 180; implicitHeight: 36
                        contentItem: Text {
                            text: parent.text; color: Theme.accentPrimary; font: Theme.fontBody; font.bold: true
                            horizontalAlignment: Text.AlignHCenter; verticalAlignment: Text.AlignVCenter
                        }
                        background: Rectangle {
                            radius: Theme.radiusSmall; color: "transparent"; border.color: Theme.accentPrimary; border.width: 1
                        }
                        onClicked: changePasswordDialog.open()
                    }
                }
            }

            SettingsSection {
                title: qsTr("Users (") + users.length + ")"
                Layout.fillWidth: true
                visible: users.length > 0

                ListView {
                    id: userList
                    Layout.fillWidth: true
                    Layout.preferredHeight: Math.min(users.length * 50 + 8, 200)
                    model: users
                    spacing: 4
                    clip: true

                    delegate: Rectangle {
                        width: parent ? parent.width : 0
                        implicitHeight: 46
                        radius: Theme.radiusSmall
                        color: Theme.bgTertiary

                        RowLayout {
                            anchors.fill: parent; anchors.margins: 10; spacing: 10
                            Text { text: "\u263A"; font.pixelSize: 16; color: Theme.accentSecondary }
                            ColumnLayout {
                                Layout.fillWidth: true; spacing: 1
                                Text { text: modelData.email || ""; font: Theme.fontBody; color: Theme.textPrimary; elide: Text.ElideRight }
                                Text { text: qsTr("Role: ") + (modelData.role || "user"); font: Theme.fontSmall; color: Theme.textMuted }
                            }
                        }
                    }
                }
            }

            SettingsSection {
                title: qsTr("Data Export / Import")
                Layout.fillWidth: true

                ColumnLayout {
                    Layout.fillWidth: true; spacing: 12

                    Text {
                        text: qsTr("Export your providers, memory facts, and RAG documents as JSON.")
                        font: Theme.fontBody; color: Theme.textSecondary; wrapMode: Text.WordWrap
                    }

                    RowLayout {
                        Layout.fillWidth: true; spacing: 12

                        Button {
                            text: qsTr("Export All")
                            flat: true; implicitWidth: 120; implicitHeight: 36
                            contentItem: Text {
                                text: parent.text; color: "#ffffff"; font: Theme.fontBody; font.bold: true
                                horizontalAlignment: Text.AlignHCenter; verticalAlignment: Text.AlignVCenter
                            }
                            background: Rectangle {
                                radius: Theme.radiusSmall
                                gradient: Gradient {
                                    GradientStop { position: 0.0; color: Theme.accentPrimary }
                                    GradientStop { position: 1.0; color: Theme.accentSecondary }
                                }
                            }
                            onClicked: exportDialog.open()
                        }

                        Button {
                            text: qsTr("Import")
                            flat: true; implicitWidth: 120; implicitHeight: 36
                            contentItem: Text {
                                text: parent.text; color: Theme.accentPrimary; font: Theme.fontBody; font.bold: true
                                horizontalAlignment: Text.AlignHCenter; verticalAlignment: Text.AlignVCenter
                            }
                            background: Rectangle {
                                radius: Theme.radiusSmall; color: "transparent"
                                border.color: Theme.accentPrimary; border.width: 1
                            }
                            onClicked: importFileDialog.open()
                        }
                    }
                }
            }

            FileDialog {
                id: exportDialog
                title: qsTr("Save backup")
                selectExisting: false
                nameFilters: ["JSON files (*.json)", "All files (*)"]
                onAccepted: {
                    var raw = exportDialog.fileUrl.toString()
                    var path = raw.startsWith("file:///") ? raw.substring(8) : raw
                    window.showLoading(true)
                    apiClient.executeAsync("export", "exportBackup", JSON.stringify([path]), "{}")
                }
            }

            FileDialog {
                id: importFileDialog
                title: qsTr("Import backup")
                nameFilters: ["JSON files (*.json)", "All files (*)"]
                onAccepted: {
                    var raw = importFileDialog.fileUrl.toString()
                    var path = raw.startsWith("file:///") ? raw.substring(8) : raw
                    window.showLoading(true)
                    apiClient.executeAsync("import", "importBackup", JSON.stringify([path]), "{}")
                }
            }

            SettingsSection {
                title: qsTr("About")
                Layout.fillWidth: true

                ColumnLayout {
                    Layout.fillWidth: true; spacing: 6
                    Text { text: qsTr("OllamoMUI \u2013 Free AI Gateway"); font: Theme.fontSubheading; color: Theme.textPrimary }
                    Text { text: qsTr("Version 1.0.4"); font: Theme.fontBody; color: Theme.textSecondary }
                    Text { text: qsTr("Copyright (c) 2024-2026 Rhasan@dev"); font: Theme.fontSmall; color: Theme.textMuted }
                }
            }
        }
    }

    Dialog {
        id: providerDialog
        property bool isEdit: false
        property int editIndex: -1
        property string editName: ""

        title: isEdit ? "Edit Provider" : "Add Provider"
        standardButtons: Dialog.Ok | Dialog.Cancel
        modal: true
        x: (parent.width - width) / 2
        y: (parent.height - height) / 3

        contentItem: ColumnLayout {
            spacing: 10; implicitWidth: 420

            Text { text: qsTr("Name"); font: Theme.fontBody; color: Theme.textPrimary }
            TextField {
                id: pName; Layout.fillWidth: true; placeholderText: qsTr("e.g. my-provider")
                background: Rectangle { radius: Theme.radiusSmall; color: Theme.surface; border.color: Theme.border; border.width: 1 }
                color: Theme.textPrimary; readOnly: providerDialog.isEdit
            }

            Text { text: qsTr("Type"); font: Theme.fontBody; color: Theme.textPrimary }
            ComboBox {
                id: pType; Layout.fillWidth: true
                model: ["openai", "anthropic", "gemini", "custom"]
                background: Rectangle { radius: Theme.radiusSmall; color: Theme.surface; border.color: Theme.border; border.width: 1 }
                contentItem: Text { text: parent.currentText; color: Theme.textPrimary; font: Theme.fontBody; verticalAlignment: Text.AlignVCenter; leftPadding: 8 }
            }

            Text { text: qsTr("URL"); font: Theme.fontBody; color: Theme.textPrimary }
            TextField {
                id: pUrl; Layout.fillWidth: true; placeholderText: qsTr("https://api.example.com/v1/chat/completions")
                background: Rectangle { radius: Theme.radiusSmall; color: Theme.surface; border.color: Theme.border; border.width: 1 }
                color: Theme.textPrimary
            }

            Text { text: qsTr("Models URL (optional)"); font: Theme.fontBody; color: Theme.textPrimary }
            TextField {
                id: pModelsUrl; Layout.fillWidth: true; placeholderText: qsTr("https://api.example.com/v1/models")
                background: Rectangle { radius: Theme.radiusSmall; color: Theme.surface; border.color: Theme.border; border.width: 1 }
                color: Theme.textPrimary
            }

            Text { text: qsTr("API Key"); font: Theme.fontBody; color: Theme.textPrimary }
            TextField {
                id: pApiKey; Layout.fillWidth: true; placeholderText: qsTr("sk-...")
                background: Rectangle { radius: Theme.radiusSmall; color: Theme.surface; border.color: Theme.border; border.width: 1 }
                color: Theme.textPrimary; echoMode: TextInput.Password
            }

            Text { text: qsTr("Default Model"); font: Theme.fontBody; color: Theme.textPrimary }
            TextField {
                id: pDefaultModel; Layout.fillWidth: true; placeholderText: qsTr("gpt-3.5-turbo")
                background: Rectangle { radius: Theme.radiusSmall; color: Theme.surface; border.color: Theme.border; border.width: 1 }
                color: Theme.textPrimary
            }

            CheckBox {
                id: pFreeHeuristic
                text: qsTr("Free model heuristic")
                contentItem: Text { text: parent.text; font: Theme.fontBody; color: Theme.textPrimary; leftPadding: 8; verticalAlignment: Text.AlignVCenter }
                indicator: Rectangle {
                    width: 20; height: 20; radius: 4; border.color: Theme.border; border.width: 1; color: pFreeHeuristic.checked ? Theme.accentPrimary : Theme.surface
                    Text { anchors.centerIn: parent; text: "\u2713"; color: "#ffffff"; visible: pFreeHeuristic.checked; font.pixelSize: 12 }
                }
            }
        }

        onAccepted: {
            var name = pName.text.trim()
            if (!name) return
            var data = {
                name: name, url: pUrl.text.trim(), type: pType.currentText,
                models_url: pModelsUrl.text.trim(), auth_type: "bearer",
                default_model: pDefaultModel.text.trim(),
                free_heuristic: pFreeHeuristic.checked, api_key: pApiKey.text.trim(),
            }
            if (providerDialog.isEdit) {
                apiClient.updateProvider(providerDialog.editName, data)
            } else {
                apiClient.addProvider(data.name, data.url, data.type, data.models_url,
                    data.auth_type, data.default_model, data.free_heuristic, data.api_key)
            }
            refreshProviders()
        }
    }

    Dialog {
        id: changePasswordDialog
        title: qsTr("Change Password")
        standardButtons: Dialog.Ok | Dialog.Cancel
        modal: true
        x: (parent.width - width) / 2; y: (parent.height - height) / 3

        contentItem: ColumnLayout {
            spacing: 10; implicitWidth: 360
            Text { text: qsTr("Current Password"); font: Theme.fontBody; color: Theme.textPrimary }
            TextField {
                id: cpOld; Layout.fillWidth: true; echoMode: TextInput.Password
                background: Rectangle { radius: Theme.radiusSmall; color: Theme.surface; border.color: Theme.border; border.width: 1 }
                color: Theme.textPrimary
            }
            Text { text: qsTr("New Password"); font: Theme.fontBody; color: Theme.textPrimary }
            TextField {
                id: cpNew; Layout.fillWidth: true; echoMode: TextInput.Password
                background: Rectangle { radius: Theme.radiusSmall; color: Theme.surface; border.color: Theme.border; border.width: 1 }
                color: Theme.textPrimary
            }
        }

        onAccepted: {
            try {
                apiClient.changePassword(cpOld.text, cpNew.text)
                cpOld.text = ""; cpNew.text = ""
            } catch(e) {
                console.warn("Password change failed:", e)
            }
        }
    }

    Dialog {
        id: confirmDialog
        property string targetName: ""
        property int targetIndex: -1

        title: qsTr("Confirm Delete")
        standardButtons: Dialog.Yes | Dialog.No
        modal: true
        x: (parent.width - width) / 2; y: (parent.height - height) / 3

        contentItem: Text {
            text: "Delete provider \"" + confirmDialog.targetName + "\"? This cannot be undone."
            font: Theme.fontBody; color: Theme.textPrimary; wrapMode: Text.WordWrap
            width: 300
        }

        onAccepted: {
            apiClient.deleteProvider(confirmDialog.targetName)
            refreshProviders()
        }
    }

    function openAddProviderDialog() {
        providerDialog.isEdit = false
        providerDialog.editIndex = -1
        providerDialog.editName = ""
        pName.text = ""; pUrl.text = ""; pModelsUrl.text = ""; pApiKey.text = ""
        pDefaultModel.text = ""; pType.currentIndex = 0; pFreeHeuristic.checked = false
        providerDialog.open()
    }

    function openEditProviderDialog(index) {
        var item = providers[index]
        providerDialog.isEdit = true
        providerDialog.editIndex = index
        providerDialog.editName = item.name
        pName.text = item.name; pUrl.text = item.url || ""
        pModelsUrl.text = item.models_url || ""
        pApiKey.text = ""; pDefaultModel.text = item.default_model || ""

        var typeIndex = pType.indexOfValue(item.type || "openai")
        pType.currentIndex = typeIndex >= 0 ? typeIndex : 0
        pFreeHeuristic.checked = !!item.free_heuristic
        providerDialog.open()
    }

    function confirmDeleteProvider(name, index) {
        confirmDialog.targetName = name
        confirmDialog.targetIndex = index
        confirmDialog.open()
    }

    function refreshProviders() {
        try {
            providers = apiClient.listProviders()
        } catch(e) {
            console.warn("Failed to load providers:", e)
        }
    }

    function refreshUsers() {
        try {
            users = apiClient.getUsers()
        } catch(e) {
            console.warn("Failed to load users:", e)
        }
    }

    Component.onCompleted: {
        refreshProviders()
        refreshUsers()
    }
}

component SettingsSection: Rectangle {
    property string title
    implicitHeight: childrenRect.height + 40
    radius: Theme.radiusLarge
    color: Theme.surface
    border.color: Theme.border
    border.width: 1

    ColumnLayout {
        anchors.fill: parent; anchors.margins: 20; spacing: 16
        Text { text: parent.title; font: Theme.fontSubheading; color: Theme.textPrimary }
        default property alias _content: contentColumn.children
        ColumnLayout { id: contentColumn; Layout.fillWidth: true; spacing: 12 }
    }
}
