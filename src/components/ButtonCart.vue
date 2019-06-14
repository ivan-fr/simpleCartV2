<template>
    <a tabindex="-1" class="btn"
       :class="{'btn-warning': cartProduct === undefined, 'btn-info': cartProduct !== undefined}" href=""
       @click.prevent="addProductToCart($event)">
        <slot></slot>
    </a>
</template>

<script>
    export default {
        name: 'ButtonCart',
        props: {
            id: {
                required: true,
                type: Number
            },
            price: {
                required: true,
                type: Number
            },
            inventory: {
                required: true,
                type: Number
            },
            date: {
                required: true,
                type: String
            },
            title: {
                required: true,
                type: String
            }
        },
        computed: {
            product() {
                return this.$store.state.products.all.find(product => product.id === this.id && product.date === this.date)
            },
            cartProduct() {
                return this.$store.state.cart.items.find(product => product.id === this.id && product.date === this.date)
            }
        },
        methods: {
            addProductToCart(e) {
                let button = e.target;
                let _popover = false;
                let msg = "";

                if (this.product.inventory <= 0) {
                    _popover = true;
                    msg = 'Vous ne pouvez plus ajouter "' + this.product.title + '" dans le panier car il n\'y plus de place disponible.';
                } else if (this.$store.state.cart.items.length >= 3) {
                    _popover = true;
                    msg = "Vous avez dépassé le nombre d'événements par panier."
                } else if (this.cartProduct !== undefined && this.cartProduct.quantity >= 9) {
                    _popover = true;
                    msg = 'Vous avez atteint le nombre maximun d\'événements pour "' + this.product.title + '".'
                }

                if (_popover) {
                    if ($(button).data("popover") === false || $(button).data("popover") === undefined) {
                        $(button).popover({
                            content: msg,
                            trigger: 'focus',
                            placement: 'top'
                        });
                        $(button).popover('toggle');
                        $(button).data('popover', true);
                    }
                } else {
                    if ($(button).data("popover") === true) {
                        $(button).popover('dispose');
                        $(button).data('popover', false);
                    }

                    this.$store.dispatch("cart/addProductToCart",
                        this.product
                    );
                }
            }
        },
        created() {
            this.$store.dispatch("products/addProduct", {
                id: this.id,
                price: this.price,
                inventory: this.inventory,
                date: this.date,
                title: this.title
            });
        }
    };
</script>
