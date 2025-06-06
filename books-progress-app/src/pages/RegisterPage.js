// Generated by Copilot
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerWithEmail } from "../services/firebaseService";

/**
 * ユーザー登録ページコンポーネント
 */
const RegisterPage = () => {
  // フォーム状態管理
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ナビゲーション
  const navigate = useNavigate();

  // フォーム送信処理
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // パスワード確認
      if (password !== confirmPassword) {
        throw new Error("パスワードが一致していません");
      }

      // パスワード強度確認
      if (password.length < 6) {
        throw new Error("パスワードは6文字以上で設定してください");
      }

      // 登録処理
      const result = await registerWithEmail(email, password);

      if (result.success) {
        // 登録成功時、書籍一覧ページへ遷移
        navigate("/");
      } else {
        // エラー表示
        setError(result.message);
      }
    } catch (error) {
      setError(error.message || "登録中にエラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2 className="page-title">新規ユーザー登録</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="email">メールアドレス</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="メールアドレスを入力"
            disabled={loading}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">パスワード</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="6文字以上のパスワード"
            disabled={loading}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">パスワード（確認）</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="パスワードを再入力"
            disabled={loading}
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-block"
          disabled={loading}
        >
          {loading ? "登録中..." : "アカウント登録"}
        </button>
      </form>{" "}
      <div className="auth-footnote">
        <p>
          すでにアカウントをお持ちの方は、
          <Link to="/login" className="simple-link">
            ログイン
          </Link>
          してください。
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
