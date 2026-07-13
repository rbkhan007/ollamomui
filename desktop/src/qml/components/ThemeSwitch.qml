import QtQuick 2.15
import QtQuick.Controls 2.15
import QtQuick.Layouts 1.15
import OllamoMUI 1.0

Rectangle {
    id: root

    property bool checked: themeManager.darkTheme
    signal toggled()

    width: 52
    height: 28
    radius: 14
    color: checked ? "#2a2a48" : "#d0d0e0"
    border.color: checked ? "#6c63ff" : "#b0b0c0"
    border.width: 1

    Behavior on color { ColorAnimation { duration: Theme.animationDuration } }

    Rectangle {
        id: thumb
        x: root.checked ? root.width - width - 3 : 3
        y: 3
        width: 22
        height: 22
        radius: 11
        color: root.checked ? "#6c63ff" : "#f5f5fa"

        Behavior on x { NumberAnimation { duration: Theme.animationDuration; easing.type: Easing.OutCubic } }
        Behavior on color { ColorAnimation { duration: Theme.animationDuration } }

        Text {
            anchors.centerIn: parent
            text: root.checked ? "\u2600" : "\u2601"
            font.pixelSize: 12
            color: root.checked ? "#ffffff" : "#666680"
        }
    }

    HoverHandler { cursorShape: Qt.PointingHandCursor }
    TapHandler {
        onTapped: {
            root.checked = !root.checked
            themeManager.darkTheme = root.checked
            root.toggled()
        }
    }
}
