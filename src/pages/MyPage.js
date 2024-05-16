import React, { useEffect, useState } from 'react';
import { db, auth, storage } from '../Firebase/fbInstance';
import { collection, query, where, orderBy, onSnapshot, deleteDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Link } from 'react-router-dom';
import { updateProfile, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import defaultProfileImage from '../components/image/defaultProfileImage.png'; // 디폴트 프로필 이미지 경로
import './MyPage.css'; // CSS 파일 추가

function MyPage() {
  const [user] = useAuthState(auth);
  const [sales, setSales] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [saves, setSaves] = useState([]);
  const [userInfo, setUserInfo] = useState({ name: '', phone: '', email: '', photoURL: '' });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    if (user) {
      const fetchUserInfo = async () => {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUserInfo(docSnap.data());
        } else {
          console.log("No such document!");
        }
      };

      fetchUserInfo();

      const salesQuery = query(collection(db, 'sales'), where("uid", "==", user.uid), orderBy('createdAt', 'desc'));
      const purchasesQuery = query(collection(db, 'purchases'), where("userId", "==", user.uid), orderBy('createdAt', 'desc'));
      const savesQuery = query(collection(db, 'saves'), where("userId", "==", user.uid), orderBy('savedAt', 'desc'));

      const unsubscribeSales = onSnapshot(salesQuery, (querySnapshot) => {
        const salesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setSales(salesData);
      });

      const unsubscribePurchases = onSnapshot(purchasesQuery, (querySnapshot) => {
        if (!querySnapshot.empty) {
          const purchasesData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setPurchases(purchasesData);
        }
      });

      const unsubscribeSaves = onSnapshot(savesQuery, async (querySnapshot) => {
        const savesData = await Promise.all(querySnapshot.docs.map(async (saveDoc) => {
          const save = saveDoc.data();
          const productRef = doc(db, 'sales', save.productId);
          const productSnap = await getDoc(productRef);
          return productSnap.exists() ? { id: productSnap.id, ...productSnap.data() } : null;
        }));
        setSaves(savesData.filter(Boolean));
      });

      return () => {
        unsubscribeSales();
        unsubscribePurchases();
        unsubscribeSaves();
      };
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      if (profileImage) {
        const imageRef = ref(storage, `profileImages/${user.uid}`);
        await uploadBytes(imageRef, profileImage);
        const photoURL = await getDownloadURL(imageRef);
        setUserInfo({ ...userInfo, photoURL });
        await updateProfile(user, { photoURL });

        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, { photoURL });
      }

      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        name: userInfo.name,
        phone: userInfo.phone,
        email: userInfo.email
      });

      if (user.email !== userInfo.email) {
        await updateProfile(user, { email: userInfo.email });
      }

      alert('프로필이 성공적으로 업데이트되었습니다.');
      setEditMode(false); // 편집 모드를 종료합니다.
      window.location.reload(); // 새로고침
    } catch (error) {
      console.error("Error updating profile: ", error);
      alert('프로필 업데이트에 실패했습니다.');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      alert('비밀번호가 성공적으로 변경되었습니다.');
    } catch (error) {
      console.error("Error changing password: ", error);
      alert('비밀번호 변경에 실패했습니다.');
    }
  };

  const deleteSale = async (saleId) => {
    const saleDoc = doc(db, "sales", saleId);
    try {
      await deleteDoc(saleDoc);
      setSales(prevSales => prevSales.filter(sale => sale.id !== saleId));
    } catch (error) {
      console.error("Error removing document: ", error);
    }
  };

  const confirmPurchase = async (purchaseId, productId) => {
    const purchaseDoc = doc(db, "purchases", purchaseId);
    const saleDoc = doc(db, "sales", productId);
    try {
      await updateDoc(purchaseDoc, { confirmed: true });
      await updateDoc(saleDoc, { confirmed: true });
    } catch (error) {
      console.error("Error confirming purchase: ", error);
    }
  };

  const refundPurchase = async (purchaseId, productId) => {
    const purchaseDoc = doc(db, "purchases", purchaseId);
    const saleDoc = doc(db, "sales", productId);
    try {
      await deleteDoc(purchaseDoc);
      setPurchases(prevPurchases => prevPurchases.filter(purchase => purchase.id !== purchaseId));
      await updateDoc(saleDoc, { confirmed: false });
    } catch (error) {
      console.error("Error refunding purchase: ", error);
    }
  };

  const handleProfileImageChange = (e) => {
    if (e.target.files[0]) {
      setProfileImage(e.target.files[0]);
    }
  };

  return (
    <div className="mypage-container">
      <div className="profile-section">
        <div className="profile-info">
          {editMode ? (
            <>
              <form onSubmit={handleUpdateProfile} className="profile-form">
                <div>
                  <label>이름: </label>
                  <input type="text" value={userInfo.name} onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })} required />
                </div>
                <div>
                  <label>전화번호: </label>
                  <input type="text" value={userInfo.phone} onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })} required />
                </div>
                <div>
                  <label>이메일: </label>
                  <input type="email" value={userInfo.email} onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })} required />
                </div>
                <div>
                  <label>프로필 사진: </label>
                  <input type="file" onChange={handleProfileImageChange} />
                  {userInfo.photoURL ? (
                    <img src={userInfo.photoURL} alt="Profile" className="profile-image" />
                  ) : (
                    <img src={defaultProfileImage} alt="Default Profile" className="profile-image" />
                  )}
                </div>
                <button type="submit" className="update-button">프로필 업데이트</button>
              </form>
              <form onSubmit={handleChangePassword} className="password-form">
                <div>
                  <label>현재 비밀번호: </label>
                  <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
                </div>
                <div>
                  <label>새 비밀번호: </label>
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                </div>
                <button type="submit" className="password-change-button">비밀번호 변경</button>
              </form>
            </>
          ) : (
            <>
              <p>이름: {userInfo.name}</p>
              <p>전화번호: {userInfo.phone}</p>
              <p>이메일: {userInfo.email}</p>
            </>
          )}
        </div>
        <img src={userInfo.photoURL || defaultProfileImage} alt="Profile" className="profile-image" />
        {!editMode && <button className="profile-change-button" onClick={() => setEditMode(true)}>프로필 변경</button>}
      </div>
      <div className="lists-section">
        <h2>판매 상품</h2>
        <div className="list">
          {sales.map((sale) => (
            <Link to={`/store/${sale.id}`} key={sale.id} className="list-item">
              <img src={sale.imageUrl} alt="Sale Image" className="item-image" />
              <div className="item-content">
                <h3>{sale.title}</h3>
                <p>{sale.description}</p>
                <p>{sale.price}원</p>
              </div>
              <button onClick={(e) => { e.preventDefault(); deleteSale(sale.id) }} className="delete-button">Delete</button>
            </Link>
          ))}
        </div>
        <h2>구매 상품</h2>
        <div className="list">
          {purchases.length > 0 ? (
            purchases.map((purchase) => (
              <Link to={`/store/${purchase.productId}`} key={purchase.id} className="list-item">
                <img src={purchase.imageUrl} alt="Purchase Image" className="item-image" />
                <div className="item-content">
                  <h3>{purchase.title}</h3>
                  <p>{purchase.description}</p>
                  <p>{purchase.price}원</p>
                </div>
                {!purchase.confirmed && (
                  <div className="purchase-buttons">
                    <button onClick={(e) => { e.preventDefault(); confirmPurchase(purchase.id, purchase.productId) }} className="confirm-button">
                      구매확정
                    </button>
                    <button onClick={(e) => { e.preventDefault(); refundPurchase(purchase.id, purchase.productId) }} className="refund-button">
                      환불
                    </button>
                  </div>
                )}
                {purchase.confirmed && <span className="confirmed-text">구매 확정</span>}
              </Link>
            ))
          ) : (
            <p>구매한 상품이 없습니다.</p>
          )}
        </div>
        <h2>저장</h2>
        <div className="list">
          {saves.length > 0 ? (
            saves.map((save) => (
              <Link to={`/store/${save.id}`} key={save.id} className="list-item">
                <img src={save.imageUrl} alt="Save Image" className="item-image" />
                <div className="item-content">
                  <h3>{save.title}</h3>
                  <p>{save.description}</p>
                  <p>{save.price}원</p>
                </div>
              </Link>
            ))
          ) : (
            <p>저장된 상품이 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default MyPage;
