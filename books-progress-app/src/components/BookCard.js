// Generated by Copilot
import React, { useState, useRef, useEffect, useCallback } from "react";

const BookCard = ({ book, onUpdateProgress, onDelete }) => {
  // 詳細表示用のポップアップ状態
  const [showDetails, setShowDetails] = useState(false);
  // 現在のページ数入力値の状態管理
  const [currentPageValue, setCurrentPageValue] = useState(book.currentPage);
  // 入力フィールドへの参照
  const pageInputRef = useRef(null);
  // 書籍データのローカルコピー
  const [localBook, setLocalBook] = useState(book);

  // propsのbookが変更されたらlocalBookも更新
  useEffect(() => {
    setLocalBook(book);
    setCurrentPageValue(book.currentPage);
  }, [book]);

  // 進捗パーセンテージを計算
  const calculateProgress = (currentPage, totalPages) => {
    if (!totalPages) return 0;
    return Math.round((currentPage / totalPages) * 100);
  };

  // 日付を整形する関数
  const formatDate = (dateString) => {
    if (!dateString) return "未設定";
    const date = new Date(dateString);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };
  // ポップアップを閉じる前に状態を再確認（useCallbackでメモ化）
  const handleClosePopup = useCallback(async () => {
    // 現在のページ数が総ページ数に達していたら、サーバーから最新データを取得する
    if (currentPageValue >= book.totalPages) {
      try {
        // サーバーから最新の状態を取得するために0ページ更新を実行（データ取得のみ）
        const result = await onUpdateProgress(book.id, currentPageValue);
        if (result && result.success && result.book) {
          setLocalBook(result.book);
        }
      } catch (err) {
        console.error("状態確認エラー:", err);
      }
    }
    setShowDetails(false);
  }, [
    book.id,
    book.totalPages,
    currentPageValue,
    onUpdateProgress,
    setLocalBook,
    setShowDetails,
  ]);

  // ポップアップの外側クリックでポップアップを閉じる
  const handleOutsideClick = (e) => {
    // イベントがポップアップの背景からのものであれば、閉じる
    if (e.target.className === "book-details-popup-overlay") {
      handleClosePopup();
    }
  };
  // ESCキーでポップアップを閉じる処理
  React.useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        handleClosePopup();
      }
    };

    if (showDetails) {
      // ポップアップが表示されている場合のみイベントリスナーを追加
      window.addEventListener("keydown", handleEsc);
    }

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [showDetails, handleClosePopup]);
  // プラスボタン処理関数
  const handleIncrement = async () => {
    // 現在のページ数を1増やす（最大は総ページ数まで）
    const newPage = Math.min(Number(currentPageValue) + 1, book.totalPages);
    setCurrentPageValue(newPage);

    try {
      // 進捗を更新
      const result = await onUpdateProgress(book.id, newPage);

      // 更新に成功し、結果に書籍データが含まれている場合はローカル状態も更新
      if (result && result.success && result.book) {
        setLocalBook(result.book);

        // 現在のページが総ページ数に達したら、ポップアップを再レンダリングして完読表示を更新
        if (newPage >= book.totalPages) {
          // 少し遅延させて再レンダリングを確実にする
          setTimeout(() => {
            setShowDetails(false);
            setShowDetails(true);
          }, 100);
        }
      }
    } catch (err) {
      console.error("進捗更新エラー:", err);
    }

    // 入力フィールドの値も更新
    if (pageInputRef.current) {
      pageInputRef.current.value = newPage;
    }
  };

  // マイナスボタン処理関数
  const handleDecrement = async () => {
    const newPage = Math.max(Number(currentPageValue) - 1, 0);
    setCurrentPageValue(newPage);

    try {
      // 進捗を更新
      const result = await onUpdateProgress(book.id, newPage);

      // 更新に成功し、結果に書籍データが含まれている場合はローカル状態も更新
      if (result && result.success && result.book) {
        setLocalBook(result.book);
      }
    } catch (err) {
      console.error("進捗更新エラー:", err);
    }

    // 入力フィールドの値も更新
    if (pageInputRef.current) {
      pageInputRef.current.value = newPage;
    }
  };
  // 入力フィールドの変更ハンドラ
  const handleInputChange = async (e) => {
    const value = parseInt(e.target.value, 10) || 0;
    setCurrentPageValue(value);

    try {
      // 進捗を更新
      const result = await onUpdateProgress(book.id, value);

      // 更新に成功し、結果に書籍データが含まれている場合はローカル状態も更新
      if (result && result.success && result.book) {
        setLocalBook(result.book);

        // 現在のページが総ページ数に達したら、ポップアップを再レンダリングして完読表示を更新
        if (value >= book.totalPages) {
          // 少し遅延させて再レンダリングを確実にする
          setTimeout(() => {
            setShowDetails(false);
            setShowDetails(true);
          }, 100);
        }
      }
    } catch (err) {
      console.error("進捗更新エラー:", err);
    }
  };

  // 最小限の情報表示カード
  const renderMinimalCard = () => {
    const progressPercentage = calculateProgress(
      localBook.currentPage,
      localBook.totalPages
    );

    return (
      <div className="book-card" onClick={() => setShowDetails(true)}>
        <h3 className="book-title">{localBook.title}</h3>

        <div className="book-progress">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${progressPercentage}%`,
              }}
            ></div>
          </div>{" "}
          <p>
            <span>
              {localBook.currentPage} / {localBook.totalPages} ページ
            </span>
            <span>{progressPercentage}%</span>
          </p>
        </div>
      </div>
    );
  };

  // 詳細情報を表示するポップアップ
  const renderDetailsPopup = () => (
    <div className="book-details-popup-overlay" onClick={handleOutsideClick}>
      <div className="book-details-popup">
        {" "}
        <button className="close-popup-btn" onClick={handleClosePopup}>
          ×
        </button>{" "}
        <h2 className="book-title">{localBook.title}</h2>
        <p className="book-author">著者: {localBook.author}</p>
        <div className="book-progress">
          <p>
            {localBook.currentPage} / {localBook.totalPages} ページ (
            {calculateProgress(localBook.currentPage, localBook.totalPages)}%)
          </p>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${calculateProgress(
                  localBook.currentPage,
                  localBook.totalPages
                )}%`,
              }}
            ></div>
          </div>
        </div>{" "}
        <div className="book-dates">
          <p className="text-muted">
            読書開始: {formatDate(localBook.startDate)}
          </p>
          <p className="text-muted">
            最終更新: {formatDate(localBook.lastUpdateDate)}
          </p>
        </div>
        <div className="progress-update">
          <label htmlFor={`progress-${localBook.id}`}>現在のページ:</label>
          <div className="progress-input">
            <button
              className="page-control-btn page-decrement-btn"
              onClick={handleDecrement}
              disabled={currentPageValue <= 0}
            >
              －
            </button>
            <input
              type="number"
              id={`progress-${localBook.id}`}
              min="0"
              max={localBook.totalPages}
              defaultValue={localBook.currentPage}
              onChange={handleInputChange}
              ref={pageInputRef}
            />
            <button
              className="page-control-btn page-increment-btn"
              onClick={handleIncrement}
              disabled={currentPageValue >= localBook.totalPages}
            >
              ＋
            </button>
            <span>/ {localBook.totalPages}</span>
          </div>
        </div>
        {localBook.memo && (
          <div className="book-memo">
            <strong>メモ:</strong>
            <p>{localBook.memo}</p>
          </div>
        )}
        <div className="book-actions">
          <button
            className="btn btn-danger"
            onClick={() => onDelete(localBook.id)}
          >
            削除
          </button>{" "}
          <button className="btn" onClick={handleClosePopup}>
            閉じる
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* 最小限の情報カードを表示 */}
      {renderMinimalCard()}

      {/* 詳細ポップアップ（表示フラグがtrueの場合のみ表示） */}
      {showDetails && renderDetailsPopup()}
    </>
  );
};

export default BookCard;
