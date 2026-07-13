import QtQuick 2.15
import QtQuick.Controls 2.15
import QtQuick.Layouts 1.15
import OllamoMUI 1.0

ApplicationWindow {
    id: window

    visible: true
    width: 1280
    height: 800
    minimumWidth: 900
    minimumHeight: 600
    title: qsTr("OllamoMUI – Free AI Gateway")

    property var currentPage: homePage

    function showToast(msg, type, dur) {
        toast.show(msg, type, dur)
    }

    property bool isLoading: false
    function showLoading(loading) {
        isLoading = loading
        loadingSpinner.running = loading
    }

    Rectangle {
        id: background
        anchors.fill: parent
        color: Theme.bgPrimary
    }

    RowLayout {
        anchors.fill: parent
        spacing: 0

        Sidebar {
            id: sidebar
            Layout.fillHeight: true
            onPageSelected: function(index) {
                stackLayout.currentIndex = index
            }
        }

        Rectangle {
            Layout.fillWidth: true
            Layout.fillHeight: true
            color: Theme.bgPrimary

            StackLayout {
                id: stackLayout
                anchors.fill: parent
                currentIndex: 0

                LoginPage {
                    id: loginPage
                    onLoginSucceeded: {
                        sidebar.currentIndex = 2
                        stackLayout.currentIndex = 2
                        showToast(qsTr("Logged in successfully"), 1)
                    }
                }
                RegisterPage {
                    id: registerPage
                    onRegisterSucceeded: {
                        sidebar.currentIndex = 2
                        stackLayout.currentIndex = 2
                        showToast(qsTr("Account created"), 1)
                    }
                }
                HomePage           { id: homePage }
                PlaygroundPage     { id: playgroundPage }
                UsagePage          { id: usagePage }
                MemoryPage         { id: memoryPage }
                RAGPage            { id: ragPage }
                SettingsPage       { id: settingsPage }
                LicensePage        { id: licensePage }
                TerminalPage       { id: terminalPage }
            }
        }
    }

    Toast {
        id: toast
        anchors.horizontalCenter: parent.horizontalCenter
    }

    ProgressSpinner {
        id: loadingSpinner
        anchors.centerIn: parent
        running: window.isLoading
        size: 56
        z: 9998
    }

    UpdateDialog {
        id: updateDialog
    }

    Shortcut { sequence: "Ctrl+1"; onActivated: { stackLayout.currentIndex = 0; sidebar.currentIndex = 0 } }
    Shortcut { sequence: "Ctrl+2"; onActivated: { stackLayout.currentIndex = 1; sidebar.currentIndex = 1 } }
    Shortcut { sequence: "Ctrl+3"; onActivated: { stackLayout.currentIndex = 2; sidebar.currentIndex = 2 } }
    Shortcut { sequence: "Ctrl+4"; onActivated: { stackLayout.currentIndex = 3; sidebar.currentIndex = 3 } }
    Shortcut { sequence: "Ctrl+5"; onActivated: { stackLayout.currentIndex = 4; sidebar.currentIndex = 4 } }
    Shortcut { sequence: "Ctrl+6"; onActivated: { stackLayout.currentIndex = 5; sidebar.currentIndex = 5 } }
    Shortcut { sequence: "Ctrl+7"; onActivated: { stackLayout.currentIndex = 6; sidebar.currentIndex = 6 } }
    Shortcut { sequence: "Ctrl+8"; onActivated: { stackLayout.currentIndex = 7; sidebar.currentIndex = 7 } }
    Shortcut { sequence: "Ctrl+9"; onActivated: { stackLayout.currentIndex = 8; sidebar.currentIndex = 8 } }
}
