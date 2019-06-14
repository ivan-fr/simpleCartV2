// initial state
// shape: [{ id, quantity }]
const state = {
    items: [],
    showCart: false,
};

// getters
const getters = {
    cartProducts: (state: any) => {
        return state.items.map(({id, date, title, price, base_inventory, quantity}) => {
            return {
                id,
                title,
                date,
                price,
                base_inventory,
                quantity,
            };
        });
    },

    cartTotalPrice: (state: any, getters: any) => {
        return getters.cartProducts.reduce((total, product) => {
            return total + product.price * product.quantity;
        }, 0);
    },

    getShowCart: (state: any) => {
        return state.showCart && state.items.length > 0;
    },
};


// actions
const actions = {
    cleanCart({state, dispatch}) {
        state.items.forEach((item) => {
            dispatch('deleteProductFromCart', item);
        });
    },

    toggleShowCart({commit}) {
        commit('toggleShowCart');
    },

    saveCart({state}) {
        localStorage.setItem('V3simpleCart', JSON.stringify(state.items));
    },

    loadCart({commit, state}) {
        commit('loadCart');
        commit('products/syncInventoryWithCart', {productsFromCart: state.items}, {root: true});
    },

    addProductToCart({state, commit, dispatch}, product) {
        dispatch('loadCart');

        if (product.inventory > 0) {
            let decrement = true;
            const cartItem = state.items.find(item => item.id === product.id && item.date === product.date);
            if (!cartItem) {
                commit('pushProductToCart', {product});
            } else if (cartItem.quantity <= 8) {
                commit('incrementItemQuantity', {id: cartItem.id, date: cartItem.date});
            } else {
                decrement = false;
            }
            // remove 1 item from stock
            if (decrement) {
                dispatch('saveCart');
                commit('products/decrementProductInventory', {id: product.id, date: product.date}, {root: true});
            }
        }

        if (state.items.length > 0) {
            commit('setShowCart', {value: true});
        }
    },

    deleteProductFromCart({commit, dispatch, state}, product) {
        dispatch('loadCart');
        const cartItem = state.items.find(item => item.id === product.id && item.date === product.date);
        if (cartItem !== undefined) {
            commit('products/addProductInventory', {
                id: cartItem.id,
                date: cartItem.date,
                quantity: cartItem.quantity,
            }, {root: true});
            commit('deleteProductFromCart', {id: cartItem.id, date: cartItem.date});
            dispatch('saveCart');
        }
    },

    setQuantityToProductCart({commit, rootState, state, dispatch}, {productFromCart, quantity}) {
        const oldquantity = quantity;

        if (isNaN(quantity)) {
            quantity = 0;
        } else if (quantity > 9) {
            quantity = 9;
        } else if (quantity <= 0) {
            quantity = 0;
        }
        if (quantity === 0) {
            dispatch('deleteProductFromCart', productFromCart);
        } else {
            dispatch('loadCart');

            const product = rootState.products.all.find(product => product.id === productFromCart.id && product.date === productFromCart.date);
            const cartItem = state.items.find(product => product.id === productFromCart.id && product.date === productFromCart.date);
            const cartItemQuantity = cartItem.quantity;

            commit('setQuantityToProductCart', {
                id: productFromCart.id,
                date: productFromCart.date,
                quantity: (quantity === 9) ? oldquantity : quantity,
            });

            if (product) {
                const deltaQuantity = quantity - cartItemQuantity;

                if (product.inventory - deltaQuantity >= 0) {
                    commit('products/addProductInventory', {
                        id: product.id,
                        date: product.date,
                        quantity: -deltaQuantity,
                    }, {root: true});
                    commit('setQuantityToProductCart', {id: productFromCart.id, date: productFromCart.date, quantity});
                } else {
                    const reste = cartItemQuantity + product.inventory;
                    commit('products/addProductInventory', {
                        id: product.id,
                        date: product.date,
                        quantity: -product.inventory,
                    }, {root: true});
                    commit('setQuantityToProductCart', {
                        id: productFromCart.id,
                        date: productFromCart.date,
                        quantity: reste,
                    });
                }
            } else {
                if (quantity >= cartItem.base_inventory) {
                    commit('setQuantityToProductCart', {
                        id: productFromCart.id,
                        date: productFromCart.date,
                        quantity: (cartItem.base_inventory > 9) ? 9 : cartItem.base_inventory,
                    });
                } else if (quantity === 9) {
                    commit('setQuantityToProductCart', {
                        id: productFromCart.id,
                        date: productFromCart.date,
                        quantity,
                    });
                }
            }

            dispatch('saveCart');
        }
    },
};

// mutations
const mutations = {
    setShowCart(state, {value}) {
        state.showCart = value;
    },

    toggleShowCart(state) {
        state.showCart = !state.showCart;
    },

    loadCart(state) {
        state.items = [];
        const llocalStorage: string | null = localStorage.getItem('V3simpleCart');
        if (llocalStorage !== null) {
            JSON.parse(llocalStorage).forEach((item) => {
                state.items.push({
                    id: item.id,
                    title: item.title,
                    date: item.date,
                    base_inventory: item.base_inventory,
                    price: item.price,
                    quantity: item.quantity,
                });
            });
        }
    },

    pushProductToCart(state, {product}) {
        state.items.push({
            id: product.id,
            title: product.title,
            date: product.date,
            base_inventory: product.base_inventory,
            price: product.price,
            quantity: 1,
        });
    },

    setQuantityToProductCart(state, {id, date, quantity}) {
        const cartItem = state.items.find(item => item.id === id && item.date === date);
        cartItem.quantity = quantity;
    },

    deleteProductFromCart(state, {id, date}) {
        state.items = state.items.filter(item => String(item.id) + item.date !== String(id) + date);
    },

    incrementItemQuantity(state, {id, date}) {
        const cartItem = state.items.find(item => item.id === id && item.date === date);
        cartItem.quantity++;
    },

    setCartItems(state, {items}) {
        state.items = items;
    },
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
};
