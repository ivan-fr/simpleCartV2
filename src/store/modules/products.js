// initial state
const state = {
    all: [],
};

// getters
const getters = {};
// actions
const actions = {
    addProduct({commit, rootState}, {
        id,
        price,
        inventory,
        date,
        title,
    }) {
        commit('addProduct', {id, price, inventory, date, title});
        commit('syncInventoryWithCart', {productsFromCart: rootState.cart.items});
    },
};

// mutations
const mutations = {
    addProduct(state, {id, price, inventory, date, title}) {
        state.all.push({id, price, inventory, date, title, base_inventory: inventory});
    },

    decrementProductInventory(state, {id, date}) {
        const product = state.all.find(product => product.id === id && product.date === date);
        product.inventory--;
    },

    addProductInventory(state, {id, date, quantity}) {
        const product = state.all.find(product => product.id === id && product.date === date);
        product.inventory += quantity;
    },

    setProductInventory(state, {id, date, quantity}) {
        const product = state.all.find(product => product.id === id && product.date === date);
        product.inventory = quantity;
    },

    syncInventoryWithCart(state, {productsFromCart}) {
        state.all.forEach(product => {
            const productFromCart = productsFromCart.find(productFromCart => product.id === productFromCart.id && product.date === productFromCart.date);
            let productFromCartQuantity = 0;
            if (productFromCart !== undefined) {
                productFromCart.base_inventory = product.base_inventory;
                if (productFromCart.quantity >= productFromCart.base_inventory) {
                    productFromCart.quantity = (productFromCart.base_inventory > 9) ? 9 : productFromCart.base_inventory;
                }
                productFromCartQuantity = productFromCart.quantity;
            }
            product.inventory = product.base_inventory - productFromCartQuantity;
        });
    },
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
};
