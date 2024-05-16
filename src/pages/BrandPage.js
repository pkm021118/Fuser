import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../Firebase/fbInstance';
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import './BrandPage.css';
import saveIcon from '../components/image/save-icon.png'; // 저장 로고의 경로를 지정하세요.

function BrandPage() {
    const { brand } = useParams();
    const [sales, setSales] = useState([]);
    const [purchasedProductIds, setPurchasedProductIds] = useState([]);

    useEffect(() => {
        const fetchPurchasedProductIds = async () => {
            const purchasesSnapshot = await getDocs(collection(db, 'purchases'));
            const purchasedIds = purchasesSnapshot.docs.map(doc => doc.data().productId);
            setPurchasedProductIds(purchasedIds);
        };

        fetchPurchasedProductIds();

        const q = query(collection(db, 'sales'), where('brand', '==', brand));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const salesData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setSales(salesData);
        });

        return () => unsubscribe();
    }, [brand]);

    const filteredSales = sales.filter(sale => !purchasedProductIds.includes(sale.id));

    return (
        <div className="brand-page-container">
            <h2 className="brand-page-header">
                Brand : {brand}
            </h2>
            <hr className="brand-page-hr" />
            <div className="brand-page-items">
                {filteredSales.map((sale) => (
                    <div key={sale.id} className="brand-page-item">
                        <Link to={`/store/${sale.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <div className="brand-page-item-image-container">
                                <img src={sale.imageUrl} alt={sale.title} className="brand-page-item-image" />
                            </div>
                            <h3 className="brand-page-item-title">{sale.title}</h3>
                            <p className="brand-page-item-price">{sale.price}원</p>
                            <p className="brand-page-item-date">{new Date(sale.createdAt.seconds * 1000).toLocaleDateString()}</p>
                        </Link>
                        <div className="brand-page-item-save">
                            <img src={saveIcon} alt="Save" />
                            <span>{sale.saveCount || 0}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default BrandPage;
