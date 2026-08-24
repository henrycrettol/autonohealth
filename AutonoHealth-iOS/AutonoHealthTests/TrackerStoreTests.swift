import XCTest
@testable import AutonoHealth

final class TrackerStoreTests: XCTestCase {
    @MainActor
    func testValuesPersistAcrossStoreInstances() throws {
        let directory = FileManager.default.temporaryDirectory
            .appendingPathComponent(UUID().uuidString, isDirectory: true)
        let fileURL = directory.appendingPathComponent("tracker.json")
        let item = try XCTUnwrap(TrackerItem.defaults.first)

        let first = TrackerStore(fileURL: fileURL)
        first.setValue("4", for: item)

        let second = TrackerStore(fileURL: fileURL)
        XCTAssertEqual(second.value(for: item), "4")
        XCTAssertEqual(second.completedCount, 1)
    }

    @MainActor
    func testBlankValueRemovesTheEntry() throws {
        let fileURL = FileManager.default.temporaryDirectory
            .appendingPathComponent(UUID().uuidString)
        let item = try XCTUnwrap(TrackerItem.defaults.first)
        let store = TrackerStore(fileURL: fileURL)

        store.setValue("5", for: item)
        store.setValue("   ", for: item)

        XCTAssertEqual(store.value(for: item), "")
        XCTAssertEqual(store.completedCount, 0)
    }
}
