import Foundation

struct HealthCondition: Identifiable, Hashable, Codable {
    let id: String
    let name: String
    let category: String
    let symbol: String
    let summary: String
    let overview: String
    let symptoms: String
    let urgentHelp: String
    let usefulTracking: String
    let evidence: [EvidenceItem]
    let sources: [ConditionSource]
}

struct EvidenceItem: Identifiable, Hashable, Codable {
    var id: String { approach }
    let approach: String
    let rating: EvidenceRating
    let meaning: String
}

enum EvidenceRating: String, Hashable, Codable {
    case strong = "Strong"
    case moderate = "Moderate"
    case limited = "Limited or mixed"
    case insufficient = "Insufficient"
}

struct ConditionSource: Identifiable, Hashable, Codable {
    var id: URL { url }
    let title: String
    let url: URL
}
