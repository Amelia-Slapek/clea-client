import { HomePage, CosmeticsAnalysisPage, ProductsPage, ProductDetailsPage, SkinCarePage, LoginPage, RegistrationPage, ArticlesPage, ProfileLayout, ProfileAccount, ProfileFavorites, ProfileArticles, ProfileAlergens, ProfileCare, ArticleDetailsPage, EmailVerificationPage, ResetPasswordPage } from './pages/pages.module';
import { AuthProvider } from './contexts/AuthContext';
import "./App.scss";
import {
  BrowserRouter as Router,
  Routes,
  Route
} from "react-router-dom";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route exact path="/" element={<HomePage />} />
          <Route path="/cosmeticsAnalysis" element={<CosmeticsAnalysisPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/product/:id" element={<ProductDetailsPage />} />
          <Route path="/skinCare" element={<SkinCarePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registration" element={<RegistrationPage />} />
          <Route path="/verify-email/:token" element={<EmailVerificationPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/profile" element={<ProfileLayout />} />
          <Route path="/profile/konto" element={<ProfileAccount />} />
          <Route path="/profile/ulubione-produkty" element={<ProfileFavorites />} />
          <Route path="/profile/ulubione-artykuły" element={<ProfileArticles />} />
          <Route path="/profile/alergeny" element={<ProfileAlergens />} />
          <Route path="/profile/pielęgnacje" element={<ProfileCare />} />
          <Route path="/articles" element={<ArticlesPage />} />
          <Route path="/article/:id" element={<ArticleDetailsPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;