import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth, storage } from '../Firebase/fbInstance';
import { doc, getDoc, updateDoc, collection, addDoc, deleteDoc, query, where, getDocs } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import defaultProfileImage from '../components/image/defaultProfileImage.png'; // 디폴트 프로필 사진 설정
import saveIcon from '../components/image/save-icon.png'; // 저장 이미지 경로
import purchaseIcon from '../components/image/구매버튼.png'; // 구매 버튼 이미지 경로
import confirmedIcon from '../components/image/거래완료.png'; // 거래 완료 버튼 이미지 경로
import editIcon from '../components/image/수정버튼.png'; // 수정 버튼 이미지 경로
import './ProductDetail.css';

function ProductDetail() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [user] = useAuthState(auth);
    const [authorName, setAuthorName] = useState('');
    const [authorPhotoURL, setAuthorPhotoURL] = useState(defaultProfileImage);
    const [editMode, setEditMode] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [brand, setBrand] = useState('');
    const [category, setCategory] = useState('');
    const [image, setImage] = useState(null);
    const [imageUrl, setImageUrl] = useState('');
    const [isSaved, setIsSaved] = useState(false);
    const [saveCount, setSaveCount] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProduct = async () => {
            const docRef = doc(db, 'sales', id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const productData = docSnap.data();
                setProduct(productData);
                setTitle(productData.title);
                setDescription(productData.description);
                setPrice(productData.price);
                setBrand(productData.brand);
                setCategory(productData.category);
                setImageUrl(productData.imageUrl);
                setSaveCount(productData.saveCount || 0);
            } else {
                console.log('No such document!');
            }
        };

        fetchProduct();
    }, [id]);

    useEffect(() => {
        if (product && user) {
            const checkIfSaved = async () => {
                const savesQuery = query(collection(db, 'saves'), where('productId', '==', id), where('userId', '==', user.uid));
                const savesSnapshot = await getDocs(savesQuery);
                setIsSaved(!savesSnapshot.empty);
            };

            const fetchAuthorDetails = async () => {
                const docRef = doc(db, 'users', product.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    setAuthorName(userData.name);
                    setAuthorPhotoURL(userData.photoURL || defaultProfileImage);
                } else {
                    console.log('No such user document!');
                }
            };

            checkIfSaved();
            fetchAuthorDetails();
        }
    }, [product, user]);

    const handleImageChange = (e) => {
        if (e.target.files[0]) {
            setImage(e.target.files[0]);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        let newImageUrl = imageUrl;

        if (image) {
            const imageRef = ref(storage, `images/${image.name}`);
            const snapshot = await uploadBytes(imageRef, image);
            newImageUrl = await getDownloadURL(snapshot.ref);
        }

        try {
            const docRef = doc(db, 'sales', id);
            await updateDoc(docRef, {
                title,
                description,
                price,
                brand,
                category,
                imageUrl: newImageUrl
            });
            setProduct({
                ...product,
                title,
                description,
                price,
                brand,
                category,
                imageUrl: newImageUrl
            });
            setEditMode(false);
            alert('수정이 성공적으로 완료되었습니다.');
        } catch (e) {
            console.error('Error updating document:', e);
            alert('수정에 실패했습니다.');
        }
    };

    const handlePurchase = () => {
        navigate(`/purchase/${id}`, { state: { authorName } });
    };

    const handleSaveToggle = async () => {
        const docRef = doc(db, 'sales', id);
        if (isSaved) {
            // Remove save
            const saveQuery = query(collection(db, 'saves'), where('productId', '==', id), where('userId', '==', user.uid));
            const saveSnapshot = await getDocs(saveQuery);
            saveSnapshot.forEach(async (doc) => {
                await deleteDoc(doc.ref);
            });
            await updateDoc(docRef, { saveCount: saveCount - 1 });
            setIsSaved(false);
            setSaveCount(saveCount - 1);
        } else {
            // Add save
            await addDoc(collection(db, 'saves'), {
                productId: id,
                userId: user.uid,
                savedAt: new Date()
            });
            await updateDoc(docRef, { saveCount: saveCount + 1 });
            setIsSaved(true);
            setSaveCount(saveCount + 1);
        }
    };

    if (!product) return <div>Loading...</div>;

    return (
        <div className="product-detail-container">
            <div className="product-image-container">
                <img src={product.imageUrl} alt={product.title} className="product-image" />
            </div>
            <div className="product-details">
                {editMode ? (
                    <form onSubmit={handleUpdate}>
                        <div className="product-title">
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                className="product-title-input"
                            />
                            <div className="product-author">
                                <img src={authorPhotoURL} alt={authorName} />
                                <p>{authorName}</p>
                            </div>
                        </div>
                        <div className="product-description-container">
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                                className="product-description-input"
                            />
                        </div>
                        <div className="product-meta">
                            <div className="product-save">
                                <img
                                    src={saveIcon}
                                    alt="Save"
                                    onClick={handleSaveToggle}
                                />
                                <span>{saveCount}</span>
                            </div>
                            <div className="product-price-input-container">
                                <input
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    required
                                    className="product-price-input"
                                />
                                <span>원</span>
                            </div>
                        </div>
                        <div className="product-category-brand">
                            <select value={category} onChange={(e) => setCategory(e.target.value)} required>
                                <option value="">카테고리 선택</option>
                                <option value="Smartphone">스마트폰</option>
                                <option value="Tablet">테블릿</option>
                                <option value="Laptop">노트북</option>
                                <option value="Watch">워치</option>
                                <option value="Desktop">데스크탑</option>
                                <option value="Other">기타</option>
                            </select>
                            <select value={brand} onChange={(e) => setBrand(e.target.value)} required>
                                <option value="">브랜드 선택</option>
                                <option value="Apple">Apple</option>
                                <option value="Samsung">Samsung</option>
                                <option value="LG">LG</option>
                            </select>
                        </div>
                        <div className="product-image-upload">
                            <label>이미지 변경:</label>
                            <input
                                type="file"
                                onChange={handleImageChange}
                            />
                        </div>
                        <button type="submit" className="product-update-button">수정하기</button>
                        <button type="button" onClick={() => setEditMode(false)} className="product-cancel-button">취소</button>
                    </form>
                ) : (
                    <>
                        <div className="product-title">
                            {product.title}
                            <div className="product-author">
                                <img src={authorPhotoURL} alt={authorName} />
                                <p>{authorName}</p>
                            </div>
                        </div>
                        <div className="product-description-container">
                            <div className="product-description">{product.description}</div>
                        </div>
                        <div className="product-meta">
                            <div className="product-save">
                                <img
                                    src={saveIcon}
                                    alt="Save"
                                    onClick={handleSaveToggle}
                                />
                                <span>{saveCount}</span>
                            </div>
                            <div className="product-price">
                                {product.price}원
                            </div>
                        </div>
                        <div className="product-date">
                            {new Date(product.createdAt.seconds * 1000).toLocaleDateString()}
                        </div>
                        <div className="product-purchase">
                            {user && user.uid === product.uid ? (
                                <img src={editIcon} alt="수정하기" onClick={() => setEditMode(true)} />
                            ) : (
                                <img src={product.confirmed ? confirmedIcon : purchaseIcon} alt="구매버튼" onClick={handlePurchase} />
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default ProductDetail;
