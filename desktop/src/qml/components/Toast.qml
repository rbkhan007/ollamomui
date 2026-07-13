import QtQuick 2.15
import QtQuick.Controls 2.15
import OllamoMUI 1.0

Rectangle {
    id: root

    property string message: ""
    property int toastType: 0
    property int duration: 3000

    signal dismissed()

    width: 360
    height: 48
    radius: Theme.radiusMedium
    z: 9999

    color: toastType === 0 ? Theme.accentPrimary :
           toastType === 1 ? Theme.accentSecondary : "#ff6b9d"

    opacity: 0.0
    y: -height - 10

    Behavior on opacity { NumberAnimation { duration: 250; easing.type: Easing.OutCubic } }
    Behavior on y { NumberAnimation { duration: 300; easing.type: Easing.OutBack } }

    RowLayout {
        anchors.fill: parent
        anchors.leftMargin: 16
        anchors.rightMargin: 12
        spacing: 10

        Text {
            text: toastType === 0 ? "\u2139" : toastType === 1 ? "\u2713" : "\u26A0"
            font.pixelSize: 18
            color: "#ffffff"
        }

        Text {
            text: root.message
            font: Theme.fontBody
            color: "#ffffff"
            Layout.fillWidth: true
            elide: Text.ElideRight
        }

        Text {
            text: "\u2716"
            font.pixelSize: 14
            color: "#ffffff"
            opacity: 0.7

            HoverHandler { cursorShape: Qt.PointingHandCursor }
            TapHandler { onTapped: root.dismiss() }
        }
    }

    Timer {
        id: dismissTimer
        interval: root.duration
        onTriggered: root.dismiss()
    }

    function show(msg, type, dur) {
        root.message = msg
        root.toastType = type !== undefined ? type : 0
        root.duration = dur !== undefined ? dur : 3000
        root.opacity = 1.0
        root.y = 10
        dismissTimer.restart()
    }

    function dismiss() {
        root.opacity = 0.0
        root.y = -root.height - 10
        dismissTimer.stop()
        root.dismissed()
    }
}
