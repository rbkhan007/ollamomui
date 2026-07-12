import sys
from pathlib import Path
from PySide6.QtCore import QUrl, QObject, Signal, Property
from PySide6.QtGui import QGuiApplication
from PySide6.QtQml import QQmlApplicationEngine
from .api_client import ApiClient
from .updater import UpdaterManager

QML_DIR = Path(__file__).resolve().parent / "qml"

class ThemeManager(QObject):
    currentThemeChanged = Signal()

    def __init__(self):
        super().__init__()
        self._dark = True

    @Property(bool, notify=currentThemeChanged)
    def darkTheme(self):
        return self._dark

    @darkTheme.setter
    def darkTheme(self, value):
        if self._dark != value:
            self._dark = value
            self.currentThemeChanged.emit()

    def toggle(self):
        self.darkTheme = not self._dark

class QmlEngine:
    def __init__(self):
        self.app = QGuiApplication.instance() or QGuiApplication(sys.argv)
        self.engine = QQmlApplicationEngine()
        self.api = ApiClient()
        self.theme = ThemeManager()
        self.updater = UpdaterManager()

        self.engine.addImportPath(str(QML_DIR))
        self.engine.addImportPath(str(QML_DIR / "components"))
        self.engine.addImportPath(str(QML_DIR / "styles"))

        self.engine.rootContext().setContextProperty("apiClient", self.api)
        self.engine.rootContext().setContextProperty("themeManager", self.theme)
        self.engine.rootContext().setContextProperty("updaterManager", self.updater)

        main_qml = QML_DIR / "main.qml"
        self.engine.load(QUrl.fromLocalFile(str(main_qml)))
        if not self.engine.rootObjects():
            sys.exit(-1)

    def run(self):
        return self.app.exec()
