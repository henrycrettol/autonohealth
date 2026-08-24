import XCTest
@testable import AutonoHealth

final class ConditionRepositoryTests: XCTestCase {
    func testFeaturedConditionHasCompleteEvidenceAndSources() {
        let condition = ConditionRepository.featured

        XCTAssertFalse(condition.overview.isEmpty)
        XCTAssertFalse(condition.urgentHelp.isEmpty)
        XCTAssertEqual(condition.evidence.count, 4)
        XCTAssertEqual(condition.sources.count, 3)
        XCTAssertTrue(condition.sources.allSatisfy { $0.url.scheme == "https" })
    }
}
