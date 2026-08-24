import Foundation
import Combine

@MainActor
final class TrackerStore: ObservableObject {
    @Published private(set) var entries: [String: DailyEntry] = [:]
    let items = TrackerItem.defaults

    private let fileURL: URL

    init(fileURL: URL? = nil) {
        self.fileURL = fileURL ?? Self.defaultFileURL()
        load()
    }

    var selectedEntry: DailyEntry {
        entries[todayKey] ?? DailyEntry(day: todayKey, values: [:])
    }

    var completedCount: Int {
        selectedEntry.values.values.filter { !$0.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty }.count
    }

    var completion: Double {
        items.isEmpty ? 0 : Double(completedCount) / Double(items.count)
    }

    func value(for item: TrackerItem) -> String {
        selectedEntry.values[item.id] ?? ""
    }

    func setValue(_ value: String, for item: TrackerItem) {
        var entry = selectedEntry
        let trimmed = value.trimmingCharacters(in: .whitespacesAndNewlines)
        if trimmed.isEmpty {
            entry.values.removeValue(forKey: item.id)
        } else {
            entry.values[item.id] = String(trimmed.prefix(180))
        }
        entries[todayKey] = entry
        save()
    }

    func clearToday() {
        entries.removeValue(forKey: todayKey)
        save()
    }

    private var todayKey: String {
        Self.dayFormatter.string(from: Date())
    }

    private func load() {
        guard let data = try? Data(contentsOf: fileURL),
              let decoded = try? JSONDecoder().decode([String: DailyEntry].self, from: data) else { return }
        entries = decoded
    }

    private func save() {
        do {
            let data = try JSONEncoder().encode(entries)
            try FileManager.default.createDirectory(
                at: fileURL.deletingLastPathComponent(),
                withIntermediateDirectories: true,
                attributes: nil
            )
            try data.write(to: fileURL, options: [.atomic, .completeFileProtection])
        } catch {
            assertionFailure("Tracker data could not be saved: \(error)")
        }
    }

    private static func defaultFileURL() -> URL {
        let root = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first!
        return root.appendingPathComponent("AutonoHealth", isDirectory: true)
            .appendingPathComponent("tracker.json")
    }

    private static let dayFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.calendar = Calendar(identifier: .gregorian)
        formatter.locale = Locale(identifier: "en_US_POSIX")
        formatter.dateFormat = "yyyy-MM-dd"
        return formatter
    }()
}
