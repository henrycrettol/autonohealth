import Foundation

enum TrackerKind: String, Codable, CaseIterable {
    case mood
    case hours
    case number
    case yesNo
    case note
}

struct TrackerItem: Identifiable, Hashable, Codable {
    let id: String
    let label: String
    let detail: String
    let symbol: String
    let kind: TrackerKind
    let unit: String?
}

struct DailyEntry: Identifiable, Hashable, Codable {
    var id: String { day }
    let day: String
    var values: [String: String]
}

extension TrackerItem {
    static let defaults: [TrackerItem] = [
        .init(id: "mood", label: "Mood", detail: "How today felt overall", symbol: "face.smiling", kind: .mood, unit: nil),
        .init(id: "sleep", label: "Sleep", detail: "Last night, in hours", symbol: "moon.stars", kind: .hours, unit: "hr"),
        .init(id: "exercise", label: "Exercise", detail: "Moderate-intensity movement", symbol: "figure.walk", kind: .number, unit: "min"),
        .init(id: "products", label: "Medications & supplements", detail: "Took today's as planned", symbol: "pills", kind: .yesNo, unit: nil),
        .init(id: "hydration", label: "Water", detail: "Against your own target", symbol: "drop", kind: .number, unit: "cups"),
        .init(id: "nutrition", label: "Food notes", detail: "Anything worth remembering", symbol: "fork.knife", kind: .note, unit: nil),
        .init(id: "symptom", label: "Symptoms", detail: "Only if there is something to note", symbol: "waveform.path.ecg", kind: .note, unit: nil),
    ]
}
