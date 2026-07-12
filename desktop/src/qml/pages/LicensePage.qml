import QtQuick 2.15
import QtQuick.Layouts 1.15
import QtQuick.Controls 2.15

Rectangle {
    color: "transparent"

    property bool hasLicense: false
    property string currentPlan: ""
    property string currentKey: ""
    property string expiresAt: ""

    function checkLicense() {
        var stored = apiClient.getPreference("license_key", "")
        if (stored) {
            hasLicense = true
            currentKey = stored
            currentPlan = apiClient.getPreference("license_plan", "")
            expiresAt = apiClient.getPreference("license_expiry", "")
            activateBtn.enabled = false
            licenseInput.text = stored
            licenseInput.readOnly = true
        }
    }

    Component.onCompleted: checkLicense()

    Flickable {
        anchors.fill: parent
        contentHeight: column.height + 80
        clip: true
        boundsBehavior: Flickable.StopAtBounds

        ColumnLayout {
            id: column
            width: parent.width - 60
            anchors.horizontalCenter: parent.horizontalCenter
            spacing: 20

            Item { Layout.preferredHeight: 10 }

            Text {
                text: qsTr("License Activation")
                font: Theme.fontHeading
                font.pixelSize: 22
                color: Theme.textPrimary
            }

            Text {
                text: hasLicense
                      ? "Your license is active."
                      : "Enter your license key to unlock Pro features."
                font: Theme.fontBody
                color: Theme.textSecondary
                wrapMode: Text.WordWrap
                Layout.fillWidth: true
            }

            Rectangle {
                Layout.fillWidth: true
                Layout.preferredHeight: 160
                radius: Theme.radiusMedium
                color: Theme.bgTertiary
                visible: !hasLicense

                ColumnLayout {
                    anchors.fill: parent
                    anchors.margins: 20
                    spacing: 14

                    Text {
                        text: qsTr("License Key")
                        font: Theme.fontBody
                        font.bold: true
                        color: Theme.textPrimary
                    }

                    Rectangle {
                        Layout.fillWidth: true
                        Layout.preferredHeight: 44
                        radius: Theme.radiusSmall
                        color: Theme.surfaceAlt
                        border.color: Theme.border

                        TextInput {
                            id: licenseInput
                            anchors.fill: parent
                            anchors.leftMargin: 12
                            anchors.rightMargin: 12
                            verticalAlignment: TextInput.AlignVCenter
                            font: Theme.fontBody
                            font.family: "Courier New"
                            font.pixelSize: 14
                            color: Theme.textPrimary
                            placeholderText: qsTr("OLLAMOMUI-...")
                            placeholderTextColor: Theme.textMuted
                            onTextChanged: {
                                activateBtn.enabled = text.trim().length > 0
                            }
                        }
                    }

                    Button {
                        id: activateBtn
                        text: qsTr("Activate License")
                        enabled: false
                        implicitHeight: 40
                        implicitWidth: 180
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
                            color: parent.enabled ? Theme.accentPrimary : Theme.textMuted
                        }

                        onClicked: {
                            window.showLoading(true)
                            var key = licenseInput.text.trim()
                            var deviceId = apiClient.getPreference("device_id", "")
                            try {
                                var resp = apiClient.activateLicense(key, deviceId)
                                apiClient.setPreference("license_key", key)
                                apiClient.setPreference("license_plan", resp.plan)
                                apiClient.setPreference("license_expiry", resp.expires_at)
                                hasLicense = true
                                currentPlan = resp.plan
                                expiresAt = resp.expires_at
                                licenseInput.readOnly = true
                                window.showToast(qsTr("License activated: ") + resp.plan, 1)
                            } catch (e) {
                                window.showToast(qsTr("Activation failed") + ": " + (e ? e.toString() : ""), 3)
                            }
                            window.showLoading(false)
                        }
                    }
                }
            }

            Rectangle {
                Layout.fillWidth: true
                visible: hasLicense
                radius: Theme.radiusMedium
                color: Theme.bgTertiary

                ColumnLayout {
                    anchors.fill: parent
                    anchors.margins: 20
                    spacing: 12

                    RowLayout {
                        spacing: 10
                        Text {
                            text: "\u2713"
                            font.pixelSize: 24
                            color: "#2da44e"
                        }
                        Text {
                            text: qsTr("License Active")
                            font: Theme.fontHeading
                            font.pixelSize: 18
                            color: "#2da44e"
                        }
                    }

                    Text {
                        text: qsTr("Plan: ") + currentPlan
                        font: Theme.fontBody
                        color: Theme.textPrimary
                    }

                    Text {
                        text: qsTr("Expires: ") + expiresAt
                        font: Theme.fontBody
                        color: Theme.textSecondary
                    }

                    Button {
                        text: qsTr("Deactivate")
                        flat: true
                        implicitHeight: 36
                        contentItem: Text {
                            text: parent.text
                            color: "#e74c3c"
                            font: Theme.fontBody
                            horizontalAlignment: Text.AlignHCenter
                            verticalAlignment: Text.AlignVCenter
                        }
                        onClicked: {
                            apiClient.setPreference("license_key", "")
                            apiClient.setPreference("license_plan", "")
                            apiClient.setPreference("license_expiry", "")
                            hasLicense = false
                            currentPlan = ""
                            expiresAt = ""
                            licenseInput.readOnly = false
                            licenseInput.text = ""
                            window.showToast(qsTr("License deactivated"), 2)
                        }
                    }
                }
            }

            Text {
                text: qsTr("Need a license? Visit ollamomui.com/pricing")
                font: Theme.fontBody
                color: Theme.accentPrimary
                visible: !hasLicense
                HoverHandler { cursorShape: Qt.PointingHandCursor }
                TapHandler { onTapped: Qt.openUrlExternally("https://ollamomui.vercel.app/pricing") }
            }

            Item { Layout.preferredHeight: 20 }
        }
    }
}
