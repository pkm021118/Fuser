import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { db, auth } from '../Firebase/fbInstance';
import { doc, getDoc, addDoc, collection, updateDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import './ProductDetail.css';
import purchaseIcon from '../components/image/구매.png'; // 구매 버튼 이미지 경로
import defaultProfileImage from '../components/image/defaultProfileImage.png'; // 기본 프로필 이미지 경로
import saveIcon from '../components/image/save-icon.png'; // 저장 버튼 이미지 경로

function PurchasePage() {
    const { id } = useParams();
    const location = useLocation();
    const [user] = useAuthState(auth);
    const [address, setAddress] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [product, setProduct] = useState(null);
    const navigate = useNavigate();
    const { authorName } = location.state || {}; // authorName을 location.state에서 가져옴

    useEffect(() => {
        const fetchProduct = async () => {
            const docRef = doc(db, 'sales', id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const productData = docSnap.data();
                // 여기서 user 컬렉션에서 authorPhotoURL 가져오기
                const authorRef = doc(db, 'users', productData.uid);
                const authorSnap = await getDoc(authorRef);
                const authorPhotoURL = authorSnap.exists() ? authorSnap.data().photoURL : defaultProfileImage;

                setProduct({ ...productData, authorPhotoURL });
            } else {
                console.log('No such document!');
            }
        };

        fetchProduct();
    }, [id]);

    const handlePurchase = async () => {
        if (!address || !paymentMethod) {
            alert('주소와 결제 방법을 입력해주세요.');
            return;
        }

        try {
            await addDoc(collection(db, 'purchases'), {
                productId: id,
                userId: user.uid,
                address,
                paymentMethod,
                createdAt: new Date(),
                title: product.title,
                description: product.description,
                price: product.price,
                imageUrl: product.imageUrl,
                authorName,
                brand: product.brand,
                category: product.category,
                confirmed: false
            });

            // 'sales' 컬렉션의 문서 업데이트
            const productDocRef = doc(db, 'sales', id);
            await updateDoc(productDocRef, { confirmed: true });

            console.log('Purchase saved to Firestore'); // 디버깅용 메시지
            alert('구매가 완료되었습니다.');
            navigate('/my');
        } catch (error) {
            console.error('Error purchasing product: ', error);
            alert('구매에 실패했습니다.');
        }
    };

    if (!product) return <div>Loading...</div>;

    return (
        <div className="product-detail-container">
            <div className="product-image-container">
                <img src={product.imageUrl} alt={product.title} className="product-image" />
            </div>
            <div className="product-details">
                <div className="product-title">
                    {product.title}
                    <div className="product-author">
                        <img src={product.authorPhotoURL || defaultProfileImage} alt={authorName} />
                        <p>{authorName}</p>
                    </div>
                </div>
                <div className="product-description-container">
                    <div className="product-description">{product.description}</div>
                </div>
                <div className="product-meta">
                    <div className="product-save">
                        <img src={saveIcon} alt="Save" />
                        <span>{product.saveCount || 0}</span>
                    </div>
                    <div className="product-price">
                        {product.price}원
                    </div>
                </div>
                <div className="product-date">
                    {new Date(product.createdAt.seconds * 1000).toLocaleDateString()}
                </div>
                <div className="purchase-form">
                    <div className="purchase-form-group">
                        <label>주소</label>
                        <input 
                            type="text" 
                            value={address} 
                            onChange={(e) => setAddress(e.target.value)} 
                            required 
                            className="purchase-input" 
                        />
                    </div>
                    <div className="purchase-form-group">
                        <label>결제 방법</label>
                        <select 
                            value={paymentMethod} 
                            onChange={(e) => setPaymentMethod(e.target.value)} 
                            required 
                            className="purchase-input"
                        >
                            <option value="">결제 방법</option>
                            <option value="toss">토스</option>
                            <option value="kakaoPay">카카오페이</option>
                            <option value="naverPay">네이버페이</option>
                            <option value="creditCard">신용카드</option>
                        </select>
                    </div>
                    <div className="purchase-button-container">
                        <img src={purchaseIcon} alt="구매하기" onClick={handlePurchase} className="purchase-button" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PurchasePage;
