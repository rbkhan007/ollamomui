import QtQuick 2.15
import OllamoMUI 1.0

Item {
    id: root

    property color colorA: "#6c63ff"
    property color colorB: "#00d4aa"
    property color colorC: "#ff6b9d"
    property real blurAmount: 120

    Rectangle {
        anchors.fill: parent
        gradient: Gradient {
            GradientStop { position: 0.0; color: root.colorA }
            GradientStop { position: 0.5; color: root.colorB }
            GradientStop { position: 1.0; color: root.colorC }
        }
        opacity: 0.12

        SequentialAnimation on opacity {
            loops: Animation.Infinite
            NumberAnimation { from: 0.08; to: 0.16; duration: 4000; easing.type: Easing.SineCurve }
            NumberAnimation { from: 0.16; to: 0.08; duration: 4000; easing.type: Easing.SineCurve }
        }
    }

    Rectangle {
        anchors.fill: parent
        color: root.colorA
        opacity: 0.06
        SequentialAnimation on x {
            loops: Animation.Infinite
            NumberAnimation { from: -parent.width * 0.5; to: parent.width * 0.5; duration: 12000; easing.type: Easing.SineCurve }
            NumberAnimation { from: parent.width * 0.5; to: -parent.width * 0.5; duration: 12000; easing.type: Easing.SineCurve }
        }
    }
}
