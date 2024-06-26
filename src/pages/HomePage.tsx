import { useState, useEffect } from 'react';
import { ProductItem } from '../components/ProductItem';
import { Product } from '../types';
import { DaoService } from '../services/dao-service';
import { Loading } from '../components/Loading';
import { BillService } from '../services/bill-service';
import { UserService } from '../services/user-service';

export function Home() {

    const user = UserService.getUserConfiguration();
    const selectedBill = user.selectedBill || 'Cuenta 1';
    const bill = BillService.getBill(selectedBill) || BillService.addNew(selectedBill);

    const [products, setProducts] = useState(null as Product[] | null);
    const [productList, setProductList] = useState(bill.products);
    const [filteredProduct, setFilteredProducts] = useState([] as Product[]);
    const [selectedGroup, setSelectedGroup] = useState(null as string | null);

    const groups = [...new Set(products?.map(p => p.group))];

    useEffect(() => {
        DaoService.getFirstCatalog().then((products) => {
            setProducts(products);
            setFilteredProducts(products);
        });
    }, []);

    const total = productList.reduce((acc, product) => acc + product.price, 0);
    const totalDiscount = total - (total * 0.2);
    const productCountByNames = productList.reduce((acc, product) => {
        acc[product.name] = (acc[product.name] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const addProduct = (product: Product) => {
        BillService.addProductToBill(bill, product);
        setProductList(bill.products);
    };

    const removeProduct = (product: Product) => {
        BillService.removeProductFromBill(bill, product);
        setProductList(bill.products);
    };

    const searchProduct = (search: string) => {
        return products?.filter((product) => product.name.toLowerCase().includes(search.toLowerCase()));
    }

    const selectGroup = (group: string) => {
        const newSelectedGroup = group === selectedGroup ? null : group;
        setSelectedGroup(newSelectedGroup);
        const filtered = newSelectedGroup ? products?.filter((product) => product.group === group) : products;
        setFilteredProducts(filtered as Product[]);
    }

    return (
        <div className="flex flex-col h-full p-2">
            {/* Header: Search and total */}
            <h1 className="flex-none text-2xl dark:text-gray-400 pb-2">{selectedBill}</h1>
            <div className="flex-none mb-2">
                <div className="flex">
                    <div className="relative flex-1">
                        <label htmlFor="search" className="sr-only">Buscar</label>
                        <input
                            id="search"
                            type="text"
                            placeholder="Buscar ..."
                            className="block pr-10 w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-4 focus:ring-blue-300 focus:outline-none"
                            onChange={(e) => setFilteredProducts(searchProduct(e.target.value) || [])}
                        />
                        {/* Search icon */}
                        <div className='absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none'>
                            <i className="text-gray-400 fa-solid fa-search"></i>
                        </div>
                    </div>
                    <div className="px-4 text-right min-w-32">
                        <span className='block text-xs text-gray-700 dark:text-gray-400 font-bold'>Oficial</span>
                        <span className="text-2xl font-medium text-gray-700 dark:text-white">
                            {total.toFixed(2)} <span className="text-green-800">€</span>
                        </span>
                    </div>
                    <div className={"px-4 min-w-32 text-right " + (!user.isPatner && 'hidden')}>
                        <span className='block text-xs text-green-700 dark:text-green-500 font-bold'>Socio</span>
                        <span className="text-2xl font-medium text-green-700 dark:text-green-500">
                            {totalDiscount.toFixed(2)} <span className="text-green-800">€</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* Header: Search and total */}
            <div className="flex-none mb-2 overflow-x-auto">
                <div className="flex">
                    {groups.map((group) => (
                        <button onClick={() => selectGroup(group)} key={group} type="button"
                            className={"flex-1 tet-center text-gray-900 border border-gray-200 font-medium rounded-lg text-xs px-3 py-2 text-center dark:border-gray-700 dark:text-white me-2 mb-2 " + ((selectedGroup === group) ? 'text-white bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-700' : 'bg-white hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-900')}>
                            {group}
                        </button>
                    ))}
                </div>
            </div>

            {/* Pruduct list */}
            <div className="overflow-y-auto flew-grow">
                <div className="flex-grow mb-4 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {products && filteredProduct?.map((product, index) => (
                            <div className={index % 2 === 0 ? 'p-4 bg-gray-50 dark:bg-gray-800' : 'p-4 bg-gray-100 dark:bg-gray-900'} key={product.name}>
                                <ProductItem product={product} isPatner={user.isPatner} onAdd={addProduct} onRemove={removeProduct} total={productCountByNames[product.name]} />
                            </div>
                        ))}
                        {!products && <Loading />}
                    </div>
                </div>
            </div>
        </div>
    );
}
