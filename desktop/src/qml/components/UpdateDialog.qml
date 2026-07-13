import QtQuick 2.15
import QtQuick.Controls 2.15
import OllamoMUI 1.0

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
                text: qsTr("\uD83D\uDD04")
            }
        }

        ColumnLayout {
            Layout.fillWidth: true
            spacing: 4

            Text {
                text: qsTr("Update available")
                font.pixelSize: 14
                font.weight: Font.Bold
                color: Theme.textPrimary
            }
            Text {
                text: qsTr("Version ") + latestVersion + " is ready to install"
                font.pixelSize: 12
                color: Theme.textSecondary
                elide: Text.ElideRight
            }
        }

        Button {
            id: updateBtn
            text: qsTr("Update")
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
            text: qsTr("Skip")
            font.pixelSize: 12
            implicitHeight: 32
            implicitWidth: 60
            Layout.alignment: Qt.AlignVCenter

            contentItem: Text {
                text: skipBtn.text
                font: skipBtn.font
                color: "#ffffff"
                horizontalAlignment: Text.AlignHCenter
                verticalAlignment: Text.AlignVCenter
            }

            background: Rectangle {
                radius: 8
                color: skipBtn.enabled ? "#636e72" : "#636e7280"
            }

            onClicked: {
                root.visible_ = false
            }
        }
    }

    Rectangle {
        visible: downloading
        anchors.fill: parent
        color: Theme.surface
        radius: 12
        z: 9999

        ColumnLayout {
            anchors.centerIn: parent
            spacing: 10

            Text {
                text: qsTr("Downloading update...")
                font.pixelSize: 13
                color: Theme.textPrimary
                Layout.alignment: Qt.AlignHCenter
            }

            Rectangle {
                Layout.fillWidth: true
                Layout.preferredHeight: 6
                Layout.leftMargin: 20
                Layout.rightMargin: 20
                radius: 3
                color: Theme.border

                Rectangle {
                    width: parent.width * (root.downloadProgress / 100)
                    height: parent.height
                    radius: 3
                    color: Theme.accentPrimary

                    Behavior on width { NumberAnimation { duration: 200 } }
                }
            }

            Text {
                text: Math.round(root.downloadProgress) + "%"
                font.pixelSize: 11
                color: Theme.textSecondary
                Layout.alignment: Qt.AlignHCenter
            }
        }
    }

    Connections {
        target: updaterManager

        function onDownloadProgress(progress) {
            root.downloadProgress = progress
        }

        function onDownloadComplete() {
            root.downloading = false
            root.visible_ = false
        }

        function onError(errorMessage) {
            root.downloading = false
            console.error("Update error:", errorMessage)
        }
    }

    Component.onCompleted: {
        root.downloadProgress = 0
        Qt.callLater(function() {
            updaterManager.checkForUpdates()
        })
    }
}
