import QtQuick 2.15
import OllamoMUI 1.0

Item {
    id: root

    property string icon: ""
    property color color: "#6c63ff"
    property color glowColor: "#6c63ff88"
    property real iconSize: 24
    property bool hovered: false

    implicitWidth: iconSize + 8
    implicitHeight: iconSize + 8

    Rectangle {
        anchors.fill: parent
        radius: width / 2
        color: root.glowColor
        scale: root.hovered ? 1.3 : 0.0
        opacity: root.hovered ? 0.4 : 0.0
        Behavior on scale { NumberAnimation { duration: 200; easing.type: Easing.OutCubic } }
        Behavior on opacity { NumberAnimation { duration: 200; easing.type: Easing.OutCubic } }
    }

    Text {
        anchors.centerIn: parent
        text: root.icon
        font.pixelSize: root.iconSize
        color: root.color
        opacity: root.hovered ? 1.0 : 0.8
        Behavior on opacity { NumberAnimation { duration: 150 } }
    }
}
