import QtQuick 2.15
import QtQuick.Controls 2.15

Rectangle {
    id: root

    property string latestVersion: ""
    property string downloadUrl: ""
    property real downloadProgress: 0
    property bool downloading: false
    property bool visible_: false

    visible: visible_ && !downloading
    anchors.horizontalCenter: parent.horizontalCenter
    anchors.bottom: parent.bottom
    anchors.bottomMargin: 24
    width: 420
    height: visible_ ? 100 : 0
    radius: 12
    color: Theme.surface
    border.color: Theme.border
    border.width: 1
    z: 9999

    Behavior on height { NumberAnimation { duration: 250; easing.type: Easing.OutCubic } }
    Behavior on opacity { NumberAnimation { duration: 200 } }

    RowLayout {
        anchors.fill: parent
        anchors.margins: 16
        spacing: 14

        Rectangle {
            width: 40; height: 40; radius: 10
            color: "#00cec91a"
            Layout.alignment: Qt.AlignVCenter

            Text {
                anchors.centerIn: parent
                font.pixelSize: 20
                text: "🔄"
            }
        }

        ColumnLayout {
            Layout.fillWidth: true
            spacing: 4

            Text {
                text: "Update available"
                font.pixelSize: 14
                font.weight: Font.Bold
                color: Theme.textPrimary
            }
            Text {
                text: "Version " + latestVersion + " is ready to install"
                font.pixelSize: 12
                color: Theme.textSecondary
                elide: Text.ElideRight
            }
        }

        Button {
            id: updateBtn
            text: "Update"
            font.pixelSize: 12
            font.weight: Font.Bold
            implicitHeight: 32
            implicitWidth: 80
            Layout.alignment: Qt.AlignVCenter
            enabled: !downloading

            contentItem: Text {
                text: updateBtn.text
                font: updateBtn.font
                color: "#ffffff"
                horizontalAlignment: Text.AlignHCenter
                verticalAlignment: Text.AlignVCenter
            }

            background: Rectangle {
                radius: 8
                color: updateBtn.enabled ? "#6c5ce7" : "#6c5ce780"
            }

            onClicked: {
                downloading = true
                updaterManager.downloadAndInstall()
            }
        }

        Button {
            id: skipBtn
            text: "Skip"
            font.pixelSize: 12
            implicitHeight: 32
            implicitWidth: 60
            Layout.alignment: Qt.AlignVCenter

            contentItem: Text {
                text: skipBtn.text
                font: skipBtn.font
                color: Theme.textSecondary
                horizontalAlignment: Text.AlignHCenter
                verticalAlignment: Text.AlignVCenter
            }

            background: Rectangle {
                radius: 8
                color: "transparent"
                border.color: Theme.border
                border.width: 1
            }

            onClicked: {
                updaterManager.skipVersion()
                root.visible_ = false
            }
        }
    }

    // Inline progress indicator (replaces the row when downloading)
    Rectangle {
        id: progressOverlay
        anchors.fill: parent
        radius: 12
        color: Theme.surface
        border.color: Theme.border
        border.width: 1
        visible: downloading
        z: 1

        ColumnLayout {
            anchors.centerIn: parent
            spacing: 10
            width: parent.width - 48

            Text {
                text: "Downloading update..."
                font.pixelSize: 13
                font.weight: Font.Bold
                color: Theme.textPrimary
                Layout.alignment: Qt.AlignHCenter
            }

            Rectangle {
                Layout.fillWidth: true
                height: 6
                radius: 3
                color: Theme.border

                Rectangle {
                    id: progressBar
                    width: parent.width * (downloadProgress / 100)
                    height: parent.height
                    radius: 3
                    color: "#6c5ce7"
                    Behavior on width { NumberAnimation { duration: 200 } }
                }
            }

            Text {
                text: Math.round(downloadProgress) + "%"
                font.pixelSize: 11
                color: Theme.textSecondary
                Layout.alignment: Qt.AlignHCenter
            }
        }
    }

    Connections {
        target: updaterManager
        function onUpdateAvailable(version, url) {
            root.latestVersion = version
            root.downloadUrl = url
            root.visible_ = true
        }
        function onUpdateProgress(progress) {
            root.downloadProgress = progress
        }
        function onUpdateFinished(success, message) {
            root.downloading = false
            if (!success) {
                root.visible_ = false
                window.showToast("Update failed: " + message, 2)
            }
        }
        function onCheckFinished() {
            if (updaterManager.status === "up_to_date") {
                // silently up to date
            }
        }
    }

    Component.onCompleted: {
        // Check for updates 3 seconds after launch
        Qt.callLater(function() {
            updaterManager.check()
        })
    }
}
