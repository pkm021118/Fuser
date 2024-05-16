import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../Firebase/fbInstance';
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import './CategoryPage.css';
import saveIcon from '../components/image/save-icon.png'; // 저장 로고의 경로를 지정하세요.

function CategoryPage({ textAlign = 'left', fontSize = '36px', lineWidth = '100%', lineThickness = '2px', lineColor = '#D9D9D9' }) {
    const { category } = useParams();
    const [sales, setSales] = useState([]);
    const [purchasedProductIds, setPurchasedProductIds] = useState([]);

    useEffect(() => {
        const fetchPurchasedProductIds = async () => {
            const purchasesSnapshot = await getDocs(collection(db, 'purchases'));
            const purchasedIds = purchasesSnapshot.docs.map(doc => doc.data().productId);
            setPurchasedProductIds(purchasedIds);
        };

        fetchPurchasedProductIds();

        const q = query(collection(db, 'sales'), where('category', '==', category));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const salesData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setSales(salesData);
        });

        return () => unsubscribe();
    }, [category]);

    const filteredSales = sales.filter(sale => !purchasedProductIds.includes(sale.id));

    return (
        <div className="category-page-container">
            <h2 className="category-page-header">
                Store : {category}
            </h2>
            <hr className="category-page-hr" />
            <div className="category-page-items">
                {filteredSales.map((sale) => (
                    <div key={sale.id} className="category-page-item">
                        <Link to={`/store/${sale.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <div className="category-page-item-image-container">
                                <img src={sale.imageUrl} alt={sale.title} className="category-page-item-image" />
                            </div>
                            <h3 className="category-page-item-title">{sale.title}</h3>
                            <p className="category-page-item-price">{sale.price}원</p>
                            <p className="category-page-item-date">{new Date(sale.createdAt.seconds * 1000).toLocaleDateString()}</p>
                        </Link>
                        <div className="category-page-item-save">
                            <img src={saveIcon} alt="Save" />
                            <span>{sale.saveCount || 0}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default CategoryPage;
