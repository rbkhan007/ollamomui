import QtQuick 2.15
import QtQuick.Layouts 1.15
import QtQuick.Controls 2.15
import OllamoMUI 1.0

Rectangle {
    color: "transparent"

    signal registerSucceeded()

    Connections {
        target: apiClient
        function onRequestFinished(id, payload) {
            if (id !== "register") return
            window.showLoading(false)
            registerSucceeded()
            window.showToast(qsTr("Account created. Please sign in."), 1)
        }
        function onRequestError(id, msg) {
            if (id !== "register") return
            window.showLoading(false)
            window.showToast(msg, 2)
        }
    }

    ColumnLayout {
        anchors.centerIn: parent
        width: Math.min(parent.width * 0.9, 420)
        spacing: Theme.padLarge

        Text {
            Layout.alignment: Qt.AlignHCenter
            text: "\u2728"
            font.pixelSize: 48
        }

        Text {
            Layout.alignment: Qt.AlignHCenter
            text: qsTr("Create Account")
            font: Theme.fontHeading
            font.pixelSize: 28
            color: Theme.textPrimary
        }

        Text {
            Layout.alignment: Qt.AlignHCenter
            text: qsTr("Sign up to get started")
            font: Theme.fontBody
            color: Theme.textSecondary
        }

        Item { Layout.preferredHeight: 10 }

        ColumnLayout {
            Layout.fillWidth: true
            spacing: 16

            Text {
                text: qsTr("Email")
                font: Theme.fontBody
                color: Theme.textPrimary
            }
            Rectangle {
                Layout.fillWidth: true
                Layout.preferredHeight: 44
                radius: Theme.radiusMedium
                color: Theme.surface
                border.color: Theme.border
                border.width: 1

                TextInput {
                    id: regEmail
                    anchors.fill: parent
                    anchors.margins: 12
                    color: Theme.textPrimary
                    font: Theme.fontBody
                    verticalAlignment: Text.AlignVCenter
                    focus: true
                }
            }

            Text {
                text: qsTr("Password")
                font: Theme.fontBody
                color: Theme.textPrimary
            }
            Rectangle {
                Layout.fillWidth: true
                Layout.preferredHeight: 44
                radius: Theme.radiusMedium
                color: Theme.surface
                border.color: Theme.border
                border.width: 1

                TextInput {
                    id: regPassword
                    anchors.fill: parent
                    anchors.margins: 12
                    color: Theme.textPrimary
                    font: Theme.fontBody
                    echoMode: TextInput.Password
                    verticalAlignment: Text.AlignVCenter
                }
            }

            Text {
                text: qsTr("Confirm Password")
                font: Theme.fontBody
                color: Theme.textPrimary
            }
            Rectangle {
                Layout.fillWidth: true
                Layout.preferredHeight: 44
                radius: Theme.radiusMedium
                color: Theme.surface
                border.color: Theme.border
                border.width: 1

                TextInput {
                    id: regConfirm
                    anchors.fill: parent
                    anchors.margins: 12
                    color: Theme.textPrimary
                    font: Theme.fontBody
                    echoMode: TextInput.Password
                    verticalAlignment: Text.AlignVCenter
                }
            }
        }

        Item { Layout.preferredHeight: 10 }

        Button {
            Layout.fillWidth: true
            Layout.preferredHeight: 44
            text: qsTr("Create Account")
            flat: true
            contentItem: Text {
                text: parent.text
                color: "#ffffff"
                font: Theme.fontBody
                font.bold: true
                font.pixelSize: 15
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
            onClicked: {
                var email = regEmail.text.trim()
                var password = regPassword.text
                var confirm = regConfirm.text
                if (!email || !password) {
                    window.showToast(qsTr("Email and password are required"), 2)
                    return
                }
                if (password !== confirm) {
                    window.showToast(qsTr("Passwords do not match"), 2)
                    return
                }
                if (password.length < 6) {
                    window.showToast(qsTr("Password must be at least 6 characters"), 2)
                    return
                }
                window.showLoading(true)
                apiClient.executeAsync("register", "register", JSON.stringify([email, password]), "{}")
            }
        }

        Button {
            Layout.alignment: Qt.AlignHCenter
            text: qsTr("Already have an account? Sign in")
            flat: true
            contentItem: Text {
                text: parent.text
                color: Theme.accentPrimary
                font: Theme.fontBody
                horizontalAlignment: Text.AlignHCenter
                verticalAlignment: Text.AlignVCenter
            }
            background: null
        }
    }
}
