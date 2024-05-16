import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../Firebase/fbInstance';
import { collection, query, orderBy, onSnapshot, getDocs } from 'firebase/firestore';
import adImage from '../components/image/AD.png';
import buttonImage1 from '../components/image/buttonImage1.png';
import buttonImage2 from '../components/image/buttonImage2.png';
import buttonImage3 from '../components/image/buttonImage3.png';
import buttonImage4 from '../components/image/buttonImage4.png';
import buttonImage5 from '../components/image/buttonImage5.png';
import buttonImage6 from '../components/image/buttonImage6.png';
import buttonImage7 from '../components/image/buttonImage7.png';
import buttonImage8 from '../components/image/buttonImage8.png';
import buttonImage9 from '../components/image/buttonImage9.png';

function StorePage() {
    const [sales, setSales] = useState([]);
    const [purchasedProductIds, setPurchasedProductIds] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPurchasedProductIds = async () => {
            const purchasesSnapshot = await getDocs(collection(db, 'purchases'));
            const purchasedIds = purchasesSnapshot.docs.map(doc => doc.data().productId);
            setPurchasedProductIds(purchasedIds);
        };

        fetchPurchasedProductIds();

        const q = query(collection(db, 'sales'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const salesData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setSales(salesData);
        });

        return () => unsubscribe();
    }, []);

    const filteredSales = sales.filter(sale => !purchasedProductIds.includes(sale.id));

    const categories = [
        { img: buttonImage4, text: "스마트폰", category: "Smartphone" },
        { img: buttonImage5, text: "테블릿", category: "Tablet" },
        { img: buttonImage6, text: "노트북", category: "Laptop" },
        { img: buttonImage7, text: "워치", category: "Watch" },
        { img: buttonImage8, text: "데스크탑", category: "Desktop" },
        { img: buttonImage9, text: "기타", category: "Other" }
    ];

    const brands = [
        { img: buttonImage1, text: "Apple", brand: "Apple" },
        { img: buttonImage2, text: "Samsung", brand: "Samsung" },
        { img: buttonImage3, text: "LG", brand: "LG" }
    ];

    const handleCategoryClick = (category) => {
        navigate(`/category/${category}`);
    };

    const handleBrandClick = (brand) => {
        navigate(`/brand/${brand}`);
    };

    return (
        <div style={{ width: '80%', margin: 'auto' }}>
            <img 
                src={adImage} 
                alt="Store Advertisement"
                style={{
                    width: '100%', 
                    height: 'auto', 
                    borderRadius: '10px', 
                    display: 'block', 
                    margin: '50px 0',
                }}
            />
            <h2 style={{ fontSize: '30px', marginTop: '50px', textAlign: 'left', color: 'black', marginLeft: '50px' }}>
                스토어
            </h2>
            <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', marginTop: '20px' }}>
                {categories.map((item, index) => (
                    <div key={index} style={{ width: '15%', margin: '5px', textAlign: 'center', background: 'transparent', border: 'none' }}>
                        <button
                            style={{ background: 'transparent', border: 'none' }}
                            onClick={() => handleCategoryClick(item.category)}
                        >
                            <img src={item.img} alt={`Feature ${item.text}`} style={{ width: '100%', borderRadius: '5px' }} />
                        </button>
                        <h2 style={{ fontSize: '20px', marginTop: '-5px' }}>{item.text}</h2>
                    </div>
                ))}
            </div>
            <h2 style={{ fontSize: '30px', marginTop: '50px', textAlign: 'left', color: 'black', marginLeft: '50px' }}>
                인기 브랜드
            </h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                {brands.map((item, index) => (
                    <div key={index} style={{ width: '25%', textAlign: 'center', margin: '0 50px' }}>
                        <button
                            style={{ background: 'transparent', border: 'none' }}
                            onClick={() => handleBrandClick(item.brand)}
                        >
                            <img src={item.img} alt={`Button ${item.text}`} style={{ width: '100%', borderRadius: '5px' }} />
                        </button>
                        <h2 style={{ fontSize: '30px', marginTop: '0px' }}>{item.text}</h2>
                    </div>
                ))}
            </div>
            <h2 style={{ fontSize: '30px', marginTop: '50px', textAlign: 'left', color: 'black', marginLeft: '50px' }}>
                최근 등록된 상품
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start' }}>
                {filteredSales.map((sale) => (
                    <div key={sale.id} style={{ width: '18%', margin: '10px', textAlign: 'center', background: 'transparent', border: 'none' }}>
                        <Link to={`/store/${sale.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <div style={{ position: 'relative', paddingBottom: '133.33%', overflow: 'hidden', borderRadius: '10px' }}>
                                <img src={sale.imageUrl} alt={sale.title} style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <h3 style={{ fontSize: '18px', marginTop: '5px' }}>{sale.title}</h3>
                            <p>{sale.price}원</p>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default StorePage;
