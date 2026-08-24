import SwiftUI

enum Brand {
    static let navy = Color(red: 7 / 255, green: 24 / 255, blue: 47 / 255)
    static let blue = Color(red: 75 / 255, green: 121 / 255, blue: 230 / 255)
    static let paleBlue = Color(red: 237 / 255, green: 245 / 255, blue: 1)
    static let green = Color(red: 39 / 255, green: 130 / 255, blue: 101 / 255)
}

struct BrandCardModifier: ViewModifier {
    func body(content: Content) -> some View {
        content
            .padding(16)
            .background(Color(.secondarySystemBackground), in: RoundedRectangle(cornerRadius: 18))
    }
}

extension View {
    func brandCard() -> some View {
        modifier(BrandCardModifier())
    }
}
