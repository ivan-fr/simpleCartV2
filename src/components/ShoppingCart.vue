<template>
    <table class="table panier table-bordered">
        <caption>Votre panier</caption>
        <thead>
        <tr>
            <th scope="col">#</th>
            <th scope="col">Événement</th>
            <th scope="col">Date</th>
            <th scope="col">Quantité</th>
            <th scope="col">Prix</th>
            <th scope="col">Supprimer ?</th>
        </tr>
        </thead>

        <transition-group name="trbody" tag="tbody">
            <tr v-for="(product, index) in products" :key="product.id + product.date">
                <td>{{ index + 1 }}</td>
                <td>{{ product.title }}</td>
                <td>{{ product.date }}</td>
                <transition name="tdcount" mode="out-in">
                    <td :key="product.quantity">
                        <div class="input-group">
                            <div class="input-group-prepend">
                        <span class="input-group-text">
                            <i class="fas fa-sort-amount-up"></i>
                        </span>
                            </div>
                            <input type="number"
                                   min="0"
                                   max="9"
                                   :value="product.quantity"
                                   @blur="updateQuantity($event, product)"
                            >
                        </div>
                    </td>
                </transition>
                <td>
                    <span class="price">{{ product.price * product.quantity | currency('€') }}</span>
                </td>
                <td><a href="#" @click.prevent="deleteProductFromCart(product)">supprimer</a></td>
            </tr>
        </transition-group>

        <tfoot>
        <th class="text-center" colspan="4">
            <a :href="submit_url" class="btn btn-warning">Valider le panier</a>
            <a href="#" @click="cleanCart()" class="btn btn-danger ml-2">Supprimer mon panier</a>
        </th>
        <th>
            Total : {{ total | currency('€') }}
            <i class="fas fa-euro-sign"></i>
        </th>
        </tfoot>
    </table>
</template>

<script>
    import {mapGetters, mapActions} from "vuex";

    export default {
        name: 'ShoppingCart',
        props: {
            submit_url: {
                required: true,
                type: String,
            },
        },
        computed: {
            ...mapGetters("cart", {
                products: "cartProducts",
                total: "cartTotalPrice",
            })
        },
        methods: {
            updateQuantity(e, product) {
                this.setQuantityToProductCart({
                    productFromCart: product,
                    quantity: parseInt(e.target.value)
                });
            },
            ...mapActions("cart", [
                "deleteProductFromCart",
                "setQuantityToProductCart",
                "cleanCart"
            ]),
        },
        created() {
            this.$store.dispatch('cart/loadCart', {});
        }
    };
</script>

<style>
    caption {
        caption-side: top;
    }

    table.panier caption {
        background-color: royalblue;
        color: white;
        text-align: center;
        font-weight: bold;
        caption-side: top;
    }

    .trbody-enter {
        background: #ffeeba !important;
    }

    .trbody-enter-to {
        background: white !important;
        transition: background 2s linear;
        -webkit-transition: background 2s linear;
        -moz-transition: background 2s linear;
    }

    .tdcount-enter {
        background: #b9daff !important;
    }

    .tdcount-enter-to {
        background: white !important;
        transition: background 2s linear;
        -webkit-transition: background 2s linear;
        -moz-transition: background 2s linear;
    }
</style>
