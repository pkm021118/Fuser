import React, { useState, useEffect } from 'react';
import { db, storage, auth } from '../Firebase/fbInstance';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import './ProductDetail.css'; // 기존 CSS 파일 재사용

function SalePage() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [image, setImage] = useState(null);
    const [brand, setBrand] = useState('');
    const [category, setCategory] = useState('');
    const [message, setMessage] = useState('');
    const [authorName, setAuthorName] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserName = async () => {
            const user = auth.currentUser;
            if (user) {
                const docRef = doc(db, 'users', user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setAuthorName(docSnap.data().name);
                } else {
                    console.log('No such user document!');
                }
            }
        };

        fetchUserName();
    }, []);

    const handleImageChange = (e) => {
        if (e.target.files[0]) {
            setImage(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!image) {
            setMessage('Please select an image first!');
            return;
        }

        const imageRef = ref(storage, `images/${image.name}`);
        const snapshot = await uploadBytes(imageRef, image);
        const imageUrl = await getDownloadURL(snapshot.ref);

        try {
            const uid = auth.currentUser ? auth.currentUser.uid : null;
            await addDoc(collection(db, 'sales'), {
                title,
                description,
                price,
                brand,
                category,
                imageUrl,
                createdAt: new Date(),
                uid,
                authorName,
                confirmed: false
            });
            setMessage('판매 등록이 성공적으로 완료되었습니다.');
            alert('판매 등록이 성공적으로 완료되었습니다.');
            navigate('/my');
        } catch (e) {
            console.error('Error adding document:', e);
            setMessage('판매 등록에 실패했습니다.');
        }
    };

    return (
        <div className="product-detail-container">
            <div className="product-details">
                <h1 className="page-title">판매하기</h1>
                {message && <div className="error-message">{message}</div>}
                <form onSubmit={handleSubmit} className="sale-form">
                    <div className="form-group">
                        <label>제목</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className="form-control"
                        />
                    </div>
                    <div className="form-group">
                        <label>상세 설명</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            className="form-control textarea-control"
                        />
                    </div>
                    <div className="form-group">
                        <label>가격</label>
                        <input
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            required
                            className="form-control"
                        />
                    </div>
                    <div className="form-group">
                        <label>브랜드</label>
                        <select value={brand} onChange={(e) => setBrand(e.target.value)} required className="form-control">
                            <option value="">브랜드 선택</option>
                            <option value="Apple">Apple</option>
                            <option value="Samsung">Samsung</option>
                            <option value="LG">LG</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>카테고리</label>
                        <select value={category} onChange={(e) => setCategory(e.target.value)} required className="form-control">
                            <option value="">카테고리 선택</option>
                            <option value="Smartphone">스마트폰</option>
                            <option value="Tablet">테블릿</option>
                            <option value="Laptop">노트북</option>
                            <option value="Watch">워치</option>
                            <option value="Desktop">데스크탑</option>
                            <option value="Other">기타</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>사진</label>
                        <input
                            type="file"
                            onChange={handleImageChange}
                            required
                            className="form-control"
                        />
                    </div>
                    <button type="submit" className="submit-button">등록</button>
                </form>
            </div>
        </div>
    );
}

export default SalePage;
