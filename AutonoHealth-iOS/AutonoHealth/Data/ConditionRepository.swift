import Foundation

enum ConditionRepository {
    static let featured = HealthCondition(
        id: "high-blood-pressure",
        name: "High blood pressure",
        category: "Heart & circulation",
        symbol: "heart.text.square",
        summary: "Blood pressure that remains above the recommended range over time. It often causes no symptoms, so accurate repeat measurements matter.",
        overview: "Blood pressure reflects the force of blood against artery walls. A diagnosis is based on properly taken, repeated readings—not one stressful or unusual measurement. Long-term elevation raises the risk of heart, brain, kidney, and eye complications.",
        symptoms: "Most people notice nothing. Headache, dizziness, or feeling “off” are not reliable ways to know your blood pressure; measurement is the only way to identify it accurately.",
        urgentHelp: "A reading higher than 180/120 mm Hg with chest pain, shortness of breath, weakness, vision change, or difficulty speaking is an emergency—call emergency services. Without those symptoms, repeat the reading and contact a healthcare professional promptly.",
        usefulTracking: "Record readings with date, time, arm, position, and relevant notes. A consistent home technique and a trend over time are more useful than isolated numbers.",
        evidence: [
            .init(approach: "DASH-style eating pattern", rating: .strong, meaning: "Consistent evidence supports blood pressure reduction; sodium reduction can add benefit."),
            .init(approach: "Structured physical activity", rating: .strong, meaning: "Regular movement is a core lifestyle component of blood pressure management."),
            .init(approach: "Guideline-supported medications", rating: .strong, meaning: "Medication selection depends on readings, cardiovascular risk, other conditions, and patient factors."),
            .init(approach: "Magnesium supplements", rating: .limited, meaning: "Trials suggest only a small average reduction; supplements are not equivalent to established therapy."),
        ],
        sources: [
            .init(title: "2025 AHA/ACC guidance", url: URL(string: "https://www.heart.org/en/health-topics/high-blood-pressure/the-facts-about-high-blood-pressure/high-bp-top-10")!),
            .init(title: "NHLBI DASH overview", url: URL(string: "https://www.nhlbi.nih.gov/health/dash-eating-plan")!),
            .init(title: "NIH magnesium fact sheet", url: URL(string: "https://ods.od.nih.gov/factsheets/Magnesium-HealthProfessional/")!),
        ]
    )

    static let all = [featured]
}
